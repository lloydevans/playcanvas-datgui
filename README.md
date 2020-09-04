# playcanvas-datgui

![alt text](https://i.ibb.co/7Y7gZN4/playcanvas-datguipreview.gif "Preview")

See a live demo [here](https://playcanv.as/p/yvrjXeBc/).

Some simple bindings between playcanvas and dat.gui for easily creating debug UI and interactive demos.

## Setup

### With pre-built script

Include the dat.gui lib in your project by getting the source from [here](https://www.npmjs.com/package/dat.gui).

Then include `build/umd/playcanvas-datgui.js` and make sure it is loaded after the dat.gui.js script.

Add the component to an object in the scene and view the inspector properties for configuration info. You can also view an example here.

### With es module

Import this module into your bundle and it will register itself as a script. It requires the dat.gui dependency.
