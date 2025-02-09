# R-NINJA

## Overview
From our experience with React, we observed that developers were writing a lot of code to handle state-to-ui and ui-to-state mediation. With watchers (as in Angular JS, Vue), lot of this glue code can be eliminated. Watchers are good when used in moderate. So, we believe that there are places (expecially higher order components like Pages, screens) where watchers can help React developers also with very less code. 

R-NINJA is written based on watchers for React ecosystem. R-NINJA watches expressions in the JSX markup and triggers React Render when any one of the expressions value changes. Simple to use is the main goal behind R-NINJA. If R-NINJA is causing performance issues or doesn't satisfy a requirement, it can be easily removed completely or removed only for a certain page or component (check babel config below).

## How to use 
- Install the package as dependency.
``` 
npm install r-ninja
```

- Add the Ninja Context to the Root component.
```
import { NinjaContext, Watcher } from 'r-ninja';
import App from "./App.tsx";

export const Root = () => {
    return (
        <NinjaContext.Provider value={Watcher.ROOT}>
            <App />
        </NinjaContext.Provider>
    );
}
```

- Change babel.config.json to add the Ninja plugin.
```
{
    "presets": [
        [
            "@babel/preset-react"
        ]
    ],
    "overrides": [{
        test: './src/pages/**/*.page.tsx',
        plugins: ['./.yalc/react-ninja/watcher.babel.plugin.js']
    }]
};
```
**Note**:In the above example, Ninja observes only files under **src/pages** folder and with names ending with **page.tsx**. Change the config based upon your project structure.

## How it works

During babel transformations, Ninja wraps a Watcher around each JSX element that is present in the files that Ninja observes. During runtime, Ninja queries these watchers to check if there is a change in prop value of the React element. This process is called **Check**. If any property is changed, then React is asked to render only the component where change is observed. 

During babel transformations, Ninja adds code to automatically trigger Check process when a event callback function is called. Code is added only in event callback that has prop  name starts with 'on' (onChange, onSubmit). For the rest of the cases (setTimeout, setInterval and other async processes), developer has to explicitly start the Check process as follows.

```
import RNinja from 'r-ninja';
...
RNinja.check();
...
```

**NOTE:** 
- Watcher doesnot watch properties that have function or object literal attached.
- Due to certain styles of JSX markup, we are not able to watch changes. Till we find a solution to those watch problems. So, instead of those styles, use alternatives provided in r-ninja. 
    - terinary operator: use When component
    - Map operator: use Repeat component

## Contributers
- Boyina Srinivasa Rao ([sboyina](https://github.com/sboyina))
