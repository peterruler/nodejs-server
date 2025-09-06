# Authentication & Authorization

Eine umfassende Anleitung zur Implementierung von Authentifizierung und Autorisierung in der nodejs-server Anwendung.

## 📋 Übersicht

Diese Dokumentation beschreibt Best Practices und Implementierungsstrategien für ein sicheres Authentication & Authorization System für das NestJS Backend und React Frontend.

---

## 🔐 Authentication (Authentifizierung)

### Konzepte

**Authentication** verifiziert die Identität eines Benutzers - "Wer bist du?"

### Empfohlene Implementierung

#### 1. JWT (JSON Web Tokens) Strategy

```bash
# Backend Dependencies installieren
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

**Vorteile:**
- ✅ Stateless (keine Server-Sessions)
- ✅ Skalierbar für Microservices
- ✅ Cross-Domain Support
- ✅ Mobile App kompatibel

#### 2. User Entity erweitern

```typescript
// src/auth/entities/user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Gehashed mit bcrypt

  @Column({ default: 'user' })
  role: string; // 'admin', 'user', 'moderator'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 3. Auth Module Struktur

```
src/auth/
├── auth.controller.ts     # Login, Register, Refresh Endpoints
├── auth.module.ts         # Auth Module Configuration
├── auth.service.ts        # Business Logic
├── guards/
│   ├── jwt-auth.guard.ts  # JWT Route Protection
│   └── roles.guard.ts     # Role-based Access Control
├── strategies/
│   └── jwt.strategy.ts    # JWT Validation Strategy
├── dto/
│   ├── login.dto.ts       # Login Request DTO
│   ├── register.dto.ts    # Registration DTO
│   └── auth-response.dto.ts # Auth Response DTO
└── entities/
    └── user.entity.ts     # User Database Entity
```

#### 4. Key Authentication Endpoints

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/auth/register` | POST | Benutzer registrieren |
| `/auth/login` | POST | Benutzer anmelden |
| `/auth/refresh` | POST | Token erneuern |
| `/auth/logout` | POST | Benutzer abmelden |
| `/auth/profile` | GET | Benutzerprofil abrufen |

---

## 🛡️ Authorization (Autorisierung)

### Konzepte

**Authorization** bestimmt, was ein authentifizierter Benutzer tun darf - "Was darfst du?"

### Role-Based Access Control (RBAC)

#### 1. Rollen-System

```typescript
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator', 
  USER = 'user'
}

export enum Permission {
  // Project Permissions
  CREATE_PROJECT = 'create:project',
  READ_PROJECT = 'read:project',
  UPDATE_PROJECT = 'update:project',
  DELETE_PROJECT = 'delete:project',
  
  // Issue Permissions
  CREATE_ISSUE = 'create:issue',
  READ_ISSUE = 'read:issue',
  UPDATE_ISSUE = 'update:issue',
  DELETE_ISSUE = 'delete:issue',
  
  // Admin Permissions
  MANAGE_USERS = 'manage:users'
}
```

#### 2. Guard Implementation

```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### 3. Decorator für Route Protection

```typescript
// decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// Controller Usage
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  
  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  findAll() {
    // Alle Benutzer und Admins können Projekte lesen
  }
  
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    // Nur Admins können Projekte löschen
  }
}
```

---

## 🔧 Implementierungsplan

### Phase 1: Backend Authentication

1. **User Entity & Migration erstellen**
2. **Auth Module implementieren** 
3. **JWT Strategy konfigurieren**
4. **Guards für Route Protection**
5. **Password Hashing mit bcrypt**

### Phase 2: Frontend Integration

1. **Auth Context/Store implementieren**
2. **Login/Register Komponenten**
3. **Token Management (localStorage/Cookie)**
4. **Protected Routes**
5. **Automatic Token Refresh**

### Phase 3: Authorization System

1. **Role-based Guards**
2. **Permission System**
3. **UI Conditional Rendering**
4. **Admin Dashboard**

---

## 🖥️ Frontend Integration

### React Auth Context

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  // Implementation...
};
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

---

## 🔒 Security Best Practices

### Backend Security

- ✅ **Password Hashing**: bcrypt mit Salt Rounds ≥ 12
- ✅ **JWT Security**: Kurze Access Token (15min) + Refresh Token
- ✅ **Input Validation**: Class-validator für alle DTOs
- ✅ **Rate Limiting**: Schutz vor Brute Force Attacken
- ✅ **CORS Configuration**: Restriktive CORS für Production
- ✅ **Helmet.js**: Security Headers
- ✅ **Environment Variables**: Secrets in .env Files

### Frontend Security

- ✅ **Secure Storage**: HttpOnly Cookies für Tokens (Production)
- ✅ **Token Expiry**: Automatic Token Refresh
- ✅ **Input Sanitization**: XSS Protection
- ✅ **HTTPS Only**: Sichere Datenübertragung
- ✅ **CSP Headers**: Content Security Policy

---

## 📊 Überwachung & Logging

### Authentication Events

```typescript
// Events to log
enum AuthEvent {
  USER_REGISTERED = 'user.registered',
  USER_LOGIN_SUCCESS = 'user.login.success',
  USER_LOGIN_FAILED = 'user.login.failed',
  TOKEN_REFRESHED = 'token.refreshed',
  USER_LOGOUT = 'user.logout',
  UNAUTHORIZED_ACCESS = 'access.unauthorized'
}
```

### Metriken

- 📈 **Login Success Rate**
- 📈 **Failed Login Attempts**
- 📈 **Token Refresh Frequency**
- 📈 **Session Duration**
- 📈 **Role Distribution**

---

## 🧪 Testing Strategy

### Backend Tests

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('should hash password correctly', async () => {
    const password = 'plainPassword';
    const hashed = await authService.hashPassword(password);
    expect(await bcrypt.compare(password, hashed)).toBe(true);
  });

  it('should generate valid JWT token', async () => {
    const user = { id: '1', email: 'test@example.com', role: 'user' };
    const token = await authService.generateToken(user);
    expect(jwt.verify(token, process.env.JWT_SECRET)).toBeTruthy();
  });
});
```

### Frontend Tests

```typescript
// AuthContext.test.tsx
describe('AuthContext', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## 🚀 Migration Strategy

### Bestehende Anwendung erweitern

1. **User Table hinzufügen** ohne bestehende Daten zu beeinträchtigen
2. **Optional Authentication** - Zunächst als Feature Flag
3. **Graduelle Migration** - Route für Route absichern
4. **Backward Compatibility** - Während Übergangsphase

### Deployment Considerations

- **Database Migration**: User Schema hinzufügen
- **Environment Variables**: JWT_SECRET, bcrypt Rounds
- **Redis/Session Store**: Für Token Blacklisting (optional)
- **Load Balancer**: Session Affinity nicht erforderlich (JWT)

---

## 📚 Weiterführende Ressourcen

### Dokumentation
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT.io](https://jwt.io/) - JWT Token Debugger
- [OWASP Auth Guide](https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html)

### Libraries
- [@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)
- [@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [class-validator](https://www.npmjs.com/package/class-validator)

---

*Dokumentation erstellt am: 6. September 2025*  
*Status: Implementierungsbereit*  
*Nächste Schritte: Phase 1 Backend Implementation*
