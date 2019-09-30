# GitHub Action - Setup xmake
Set up your GitHub Actions workflow with a specific version of xmake

## Usage

See [action.yml](./action.yml).

## Example

Use latest version:
```yml
uses: xmake-io/github-action-setup-xmake@v1
```

Use specified version:
```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '2.2.8'
```

Use semver:
```yml
uses: xmake-io/github-action-setup-xmake@v1
with:
  xmake-version: '>=2.2.6 <=2.2.8'
```