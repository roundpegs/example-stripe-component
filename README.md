# Stripe Component
Example stripe compnent. **Note:** This is a simplified version of the stripe component currently available withen Adalo.

## Running Locally

First run:

```
yarn             # Install dependencies
npx adalo login  # Login to adalo locally
```

Then run:

```
yarn start
```

This will make the package available in Adalo under the add-component menu. Because this package has a different package name than the existing stripe component, it will show up separately.

## Storybook (local testing)

To test the component in the browser outside of Adalo, you can run the Storybook. To do this, run:

```
yarn storybook
```

This should automatically open your browser to [http://localhost:6006](http://localhost:6006)

## package.json

If you open `package.json` you will see that there is a new `"adalo"` section, which holds information about the adalo components in the package. This contains a list of components, by name (which correlates to the export name in `index.js`) and a `manifest` which refers to the location of the `manifest.json` file associated with the comonent. For more on this, see our [Library Documentation](https://github.com/AdaloHQ/docs). 