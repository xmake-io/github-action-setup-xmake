jest.mock('./git', () => ({
    lsRemote() {
        return {
            '1.0.0': '100000000',
            '1.0.1': '100000001',
            '2.0.0': '200000000',
            '2.0.1': '200000001',
        };
    },
}));
import { selectVersion } from './versions';

describe('selectVersion', () => {
    it('should return correct version for latest', async () => {
        await expect(selectVersion('latest')).resolves.toEqual({
            version: '2.0.1',
            sha: '200000001',
        });
    });
    it('should throw for no matched', async () => {
        await expect(selectVersion('1.2.3')).rejects.toThrowError(/No matched releases of xmake-version/);
    });
    it('should return correct version for given', async () => {
        await expect(selectVersion('v1.0.1')).resolves.toEqual({
            version: '1.0.1',
            sha: '100000001',
        });
    });
    it('should return correct version for range', async () => {
        await expect(selectVersion('>=2')).resolves.toEqual({
            version: '2.0.1',
            sha: '200000001',
        });
    });
});
