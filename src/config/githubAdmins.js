const builtInGitHubAdminIds = ['230255671'];

const configuredGitHubAdminIds = (process.env.GITHUB_ADMIN_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const githubAdminIds = new Set([
    ...builtInGitHubAdminIds,
    ...configuredGitHubAdminIds
]);

const isGitHubAdmin = (providerId) => (
    githubAdminIds.has(String(providerId || '').trim())
);

const promoteGitHubAdmin = async (user, providerId) => {
    if (!user || !isGitHubAdmin(providerId) || user.role === 'admin') {
        return false;
    }

    user.role = 'admin';
    await user.save();

    return true;
};

export {
    githubAdminIds,
    isGitHubAdmin,
    promoteGitHubAdmin
};
