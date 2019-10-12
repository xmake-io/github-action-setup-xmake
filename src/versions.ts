import * as core from '@actions/core'
import * as semver from 'semver'

export const versions: { [v: string]: string } = {
    "1.0.1": "723ec3e970e17f48a601fe2a919b9802b5e516fa",
    "1.0.2": "84fa20ca3ded99b9667609c5cb2e56b2308c8e4b",
    "1.0.3": "e56812a09d3677957c41bccc8988599208e3b49a",
    "1.0.4": "825dda9d93448ba783e18f7947eef0b4eb07942e",
    "2.0.1": "432fd6a40018f4c29e08f1d4cadf1ccc387a0cff",
    "2.0.2": "d24fcddbc2f1093f3943a917d99c5a8989ef2644",
    "2.0.3": "b5f21a05b1cdaf46314238b4cc665976294df1da",
    "2.0.4": "2b15a1b5b149e5156e22358f3d29b4de63473376",
    "2.0.5": "b168ce05d763957ed05844141d77d155bf842e7a",
    "2.1.1": "5ba22ca230c3f3f9477491df6d39f11d53132fb1",
    "2.1.2": "bf69a2413117cf21c53bde1edbda713e77d4fd9b",
    "2.1.3": "248b2cc8a96d41445a2e46d259d14fea8e4203ec",
    "2.1.4": "1d94a23a7db35631f4b33b8b0b3968d0e62ffe2a",
    "2.1.5": "72f68f941f9b6d07f71811fe403a2dc178270af0",
    "2.1.6": "7ea60d24da152469258a4cb35b3ce591ea2fd961",
    "2.1.7": "a04725662933fbbe3ad4a319d03267fc32907242",
    "2.1.8": "6c3f42dad5840210ee7294ca295f6c7b18c32291",
    "2.1.9": "0f1e8530e89a9432678ed6fe4fef25d0485d1293",
    "2.2.1": "f15ff1ca73b02ff5f522c9fe59004331b1b410fb",
    "2.2.2": "18a42e0e8980e3edc39198b18c5c4b9a464ea381",
    "2.2.3": "c4d0e69abf2b9caa88b997ca1f2935b6e0b00c9f",
    "2.2.5": "d71a01615883fffa53fbd28e578db14353628a52",
    "2.2.6": "eb60a76b7454975d151f2d8b5d9e19b26d561c2d",
    "2.2.7": "72bd93de8dd64cc5de8986860819a5873ce08fe5",
    "2.2.8": "6a2e390a79c4f0444a03b566d4bf24849a6ee3a3",
}

export function selectVersion(version?: string) {
    version = version || core.getInput('xmake-version') || 'latest'
    if (version.toLowerCase() === 'latest') version = ''
    version = semver.validRange(version)
    if (!version) throw new Error(`Invalid input xmake-version: ${core.getInput('xmake-version')}`)

    const ver = semver.maxSatisfying(Object.keys(versions), version)
    if (!ver) throw new Error(`No matched releases of xmake-version: ${version}`)

    const sha = versions[ver]
    core.info(`selected xmake v${ver} (commit: ${sha.substr(0, 8)})`)
    return { version: ver, sha }
}