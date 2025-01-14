import * as core from '@actions/core';

/**
 * Indicates whether the POST action is running
 */
export const IsPost = !!core.getState('isPost');

/**
 * The repository path for the POST action. The value is empty during the MAIN action.
 */
export const RepositoryPath = core.getState('repositoryPath');

/**
 * The set-safe-directory for the POST action. The value is set if input: 'safe-directory' is set during the MAIN action.
 */
export const PostSetSafeDirectory = core.getState('setSafeDirectory') === 'true';

/**
 * The SSH key path for the POST action. The value is empty during the MAIN action.
 */
export const SshKeyPath = core.getState('sshKeyPath');

/**
 * The SSH known hosts path for the POST action. The value is empty during the MAIN action.
 */
export const SshKnownHostsPath = core.getState('sshKnownHostsPath');

// Publish a variable so that when the POST action runs, it can determine it should run the cleanup logic.
// This is necessary since we don't have a separate entry point.
if (!IsPost) {
    core.saveState('isPost', 'true');
}
