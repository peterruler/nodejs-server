import { Test } from '@nestjs/testing';
import { IssueTrackerController } from '../src/issuetracker/issuetracker.controller';
import { IssueTrackerService } from '../src/issuetracker/issuetracker.service';

describe('IssueTrackerController', () => {
  let controller: IssueTrackerController;
  const svc = {
    listProjects: jest.fn(),
    getProject: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    listIssues: jest.fn(),
    getIssue: jest.fn(),
    createIssue: jest.fn(),
    updateIssue: jest.fn(),
    deleteIssue: jest.fn(),
  } as unknown as jest.Mocked<IssueTrackerService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [IssueTrackerController],
      providers: [
        {
          provide: IssueTrackerService,
          useValue: svc,
        },
      ],
    }).compile();

    controller = moduleRef.get(IssueTrackerController);

    // Reset all mocks between tests
    jest.resetAllMocks();
  });

  it('lists projects', async () => {
    (svc.listProjects as any).mockResolvedValue([{ id: 'p1', name: 'P1', active: true }]);
    const res = await controller.listProjects();
    expect(res).toEqual([{ id: 'p1', name: 'P1', active: true }]);
    expect(svc.listProjects).toHaveBeenCalledTimes(1);
  });

  it('creates a project', async () => {
    (svc.createProject as any).mockResolvedValue({ id: 'p1', name: 'New', active: true });
    const res = await controller.createProject({ name: 'New', active: true });
    expect(res).toEqual({ id: 'p1', name: 'New', active: true });
    expect(svc.createProject).toHaveBeenCalledWith({ name: 'New', active: true });
  });

  it('lists issues (all)', async () => {
    (svc.listIssues as any).mockResolvedValue([{ id: 'i1', title: 'Issue', priority: '2', dueDate: '2025-01-01', done: false, projectId: 'p1' }]);
    const res = await controller.listIssues();
    expect(res[0]).toHaveProperty('id', 'i1');
    expect(svc.listIssues).toHaveBeenCalledWith(undefined);
  });

  it('lists issues by projectId', async () => {
    (svc.listIssues as any).mockResolvedValue([]);
    await controller.listIssues('p1');
    expect(svc.listIssues).toHaveBeenCalledWith('p1');
  });

  it('creates an issue', async () => {
    const dto = { title: 'T', priority: '1', dueDate: '2025-12-31', done: false, projectId: 'p1' };
    (svc.createIssue as any).mockResolvedValue({ id: 'i1', ...dto });
    const res = await controller.createIssue(dto as any);
    expect(res).toEqual({ id: 'i1', ...dto });
    expect(svc.createIssue).toHaveBeenCalledWith(dto);
  });

  it('deletes an issue', async () => {
    (svc.deleteIssue as any).mockResolvedValue(undefined);
    await controller.deleteIssue('i1');
    expect(svc.deleteIssue).toHaveBeenCalledWith('i1');
  });
});

