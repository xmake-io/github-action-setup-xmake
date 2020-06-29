import * as git from './git';
import * as semver from 'semver';
import { Repo } from './interfaces';

describe('lsRemote', () => {
    it('should return correct records', async () => {
        const records = await git.lsRemote(Repo('xmake-io/xmake'));
        expect(records).toHaveProperty('heads');
        expect(records).toHaveProperty('tags');
        expect(records).toHaveProperty('pull');

        expect(Object.keys(records.tags).length).not.toBeLessThan(10);
        for (const tag in records.tags) {
            const ref = records.tags[tag];
            expect(semver.parse(tag)).toBeInstanceOf(semver.SemVer);
            expect(ref).toMatch(/^[0-9a-f]{40}$/gi);
        }
        for (const branch in records.heads) {
            const ref = records.heads[branch];
            expect(ref).toMatch(/^[0-9a-f]{40}$/gi);
        }
    }, 100000);
});
