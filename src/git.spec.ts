import * as git from './git';
import * as semver from 'semver';

describe('lsRemote', () => {
    it('should return correct records', async () => {
        const records = await git.lsRemote();
        expect(Object.keys(records).length).not.toBeLessThan(10);
        for (const tag in records) {
            const ref = records[tag];
            expect(semver.parse(tag)).toBeInstanceOf(semver.SemVer);
            expect(ref).toMatch(/^[0-9a-f]{40}$/gi);
        }
    }, 100000);
});
