import React from 'react';
import { AlertCircle, Edit, FolderPlus, RefreshCw, Plus, ExternalLink, Trash, X } from 'lucide-react';
import { truncateProjectName } from '../utils/projectUtils';

const ProjectList = ({ 
  projectHook, 
  onProjectLoad,
  jsonInput,
  setJsonInput,
  showJsonInputModal,
  setShowJsonInputModal,
  onJsonModalSubmit
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Master AI</h1>
          <p className="text-lg text-gray-600">프로젝트 대시보드</p>
        </div>

        {projectHook.loadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Loading Error</h3>
                <p className="text-sm text-red-700 mt-1">{projectHook.loadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* 프로젝트 목록 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Projects</h3>
            <div className="flex gap-2">
              <button
                onClick={() => projectHook.setShowAddProjectModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                Add Project
              </button>
              <button
                onClick={() => setShowJsonInputModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add JSON
              </button>
              <button
                onClick={projectHook.loadAvailableProjects}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${projectHook.isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {projectHook.projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 items-start">
              {projectHook.projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer relative group min-h-[80px]"
                  onClick={() => onProjectLoad(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 break-words leading-tight" title={project.name}>
                        {project.name}
                      </h4>
                      {project.isExternal && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                          <ExternalLink className="w-3 h-3" />
                          External Link
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        projectHook.handleDeleteProject(project);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No projects found. Add a new project to get started.</p>
            </div>
          )}
        </div>

        {/* 프로젝트 추가 모달 */}
        {projectHook.showAddProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Project</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectHook.newProjectName}
                    onChange={(e) => projectHook.setNewProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Path</label>
                  <input
                    type="text"
                    value={projectHook.newProjectPath}
                    onChange={(e) => projectHook.setNewProjectPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter project path"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    projectHook.setShowAddProjectModal(false);
                    projectHook.setNewProjectName('');
                    projectHook.setNewProjectPath('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={projectHook.handleAddProject}
                  disabled={projectHook.isCreatingProject || !projectHook.newProjectName.trim() || !projectHook.newProjectPath.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {projectHook.isCreatingProject ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-4 h-4" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 프로젝트 삭제 확인 모달 */}
        {projectHook.showDeleteConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Delete Project</h3>
              
              <p className="text-gray-700 mb-4">
                이 작업은 되돌릴 수 없습니다. 프로젝트 "{projectHook.projectToDelete?.name}"를 삭제하려면 프로젝트 이름을 정확히 입력하세요.
              </p>
              
              <input
                type="text"
                value={projectHook.deleteConfirmText}
                onChange={(e) => projectHook.setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                placeholder="프로젝트 이름을 입력하세요"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    projectHook.setShowDeleteConfirmModal(false);
                    projectHook.setProjectToDelete(null);
                    projectHook.setDeleteConfirmText('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={projectHook.confirmDeleteProject}
                  disabled={projectHook.isDeletingProject || projectHook.deleteConfirmText !== projectHook.projectToDelete?.name}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {projectHook.isDeletingProject ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Delete Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JSON 입력 모달 */}
        {showJsonInputModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">JSON Data Input</h3>
              
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"tasks": [{"id": 1, "title": "Task 1", "status": "pending", "priority": "high"}]}'
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
              />
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowJsonInputModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onJsonModalSubmit}
                  disabled={!jsonInput.trim()}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Load Project Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;