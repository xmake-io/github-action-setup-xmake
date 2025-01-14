# GitHub Action - Setup xmake

[![Build status](https://github.com/xmake-io/github-action-setup-xmake/workflows/test/badge.svg)](https://github.com/xmake-io/github-action-setup-xmake/actions)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/xmake-io/github-action-setup-xmake)](https://github.com/marketplace/actions/setup-xmake)

Set up your GitHub Actions workflow with a specific version of xmake

## Usage

See [action.yml](./action.yml).

## Example

### Use latest version

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: latest
```

### Use specified version

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '2.5.3'
```

### Use specified branch

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: branch@master
```

### Use semver

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '>=2.2.6 <=2.5.3'
```

### Cache xmake

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '2.9.7'
  actions-cache-folder: '.xmake-cache'
```

### Cache xmake with cachekey

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '2.9.7'
  actions-cache-folder: '.xmake-cache'
  actions-cache-key: 'archlinux-ci'
```

### Cache packages

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '2.9.7'
  package-cache: true
  package-cache-key: 'archlinux-ci'
```

### Cache build

By default, xmake disables build cache when building on ci, so we need to enable it first.

```bash
$ xmake f --policies=build.ccache:y
```

And xmake v2.9.8 will enable it by default if action/build-cache is enabled.

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '2.9.7'
  build-cache: true
  build-cache-key: 'archlinux-ci'
```

Cache build with the specific build path.

```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '2.9.7'
  build-cache: true
  build-cache-path: 'build/.build_cache'
```

## Contributing

### Prepare development environment

```bash
pnpm install
```

### Draft a new release

```bash
pnpm release
git add .
git commit -m "build: release"
pnpm version [new-version]

# for a minor version or patch of v1
git tag --delete v1
git tag v1

git push origin master
git push --tags --force
```

### Development and debug

```bash
git branch test
git checkout test
pnpm build
pnpm release
git-commit -a -m "..."
git push origin test
```
