import * as pc from "playcanvas";
import * as dat from "dat.gui";

/**
 * Some quick and simple bindings between playcanvas and dat.gui for easilly creating interactivity for debugging and example/demos.
 *
 */
export class PcDatGui extends pc.ScriptType {
  /**
   * Used to auto-open olders to a certain depth.
   */
  static openDepth = 0;

  /**
   * dat.GUI instance.
   */
  public gui: dat.GUI = new dat.GUI();

  /**
   * pc.Picker instance.
   */
  private picker: pc.Picker;

  /**
   * Currently selected entity for selection mode.
   */
  private selectedEntity?: pc.Entity;

  /**
   * Called when script is about to run for the first time.
   */
  public initialize(): void {
    this.gui.useLocalStorage = false;

    this.picker = new pc.Picker(this.app, 1024, 1024);

    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onSelect, this);

    this.cameraEntity = this.cameraEntity ?? this.app.root.findComponent("camera").entity;

    if (!this.cameraEntity?.camera) {
      throw new Error("Can't find camera.");
    }

    this.on("attr:selectionMode", () => {
      this.clear();
    });

    this.on("attr:width", () => {
      this.gui.width = this.width;
    });

    this.on("attr:open", () => {
      if (this.open) {
        this.show();
      } //
      else {
        this.hide();
      }
    });

    this.on("attr:opacity", () => {
      this.gui.domElement.style.opacity = this.opacity.toString();
    });

    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);

    this.gui.domElement = window.document.getElementsByClassName("main")[0] as HTMLDivElement;
    this.gui.domElement.style.webkitTransition = "opacity 0.5s;";
    this.gui.domElement.style.transition = "opacity 0.5s;";

    // Trigger update events once on init.
    this.opacity = this.opacity;
    this.width = this.width;
    this.open = this.open;
  }

  /**
   * Add an entity or script component.
   *
   * @param target - target entity or script component instance.
   * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
   */
  public add(target: pc.Entity | pc.ScriptComponent, folder: string | dat.GUI) {
    if (target instanceof pc.Entity) {
      this.addEntity(target);
    }
    //
    else if (target instanceof pc.ScriptComponent) {
      this.addScriptComponent(target, folder);
    }
    //
    else {
      throw new Error("Target must be instance of pc.Entity or pc.ScriptComponent.");
    }
  }

  /**
   * Clear all.
   */
  public clear() {
    Object.values(this.gui.__folders).forEach((el) => {
      this.gui.removeFolder(el);
    });
  }

  /**
   * Show the panel.
   */
  public show() {
    if (this.gui.domElement.style.display === "none") {
      this.gui.domElement.style.display = "";
      this.gui.open();
    }
  }

  /**
   * Hide the panel.
   */
  public hide() {
    if (this.gui.domElement.style.display === "") {
      this.gui.domElement.style.display = "none";
      this.gui.close();
      this.clear();
    }
  }

  /**
   * Set the entity selection.
   *
   * @param entity - Target entity instance.
   */
  public selectEntity(entity: pc.Entity) {
    this.selectedEntity = entity;
    this.addEntity(entity);
  }

  /**
   * Add an entity.
   *
   * @param entity - Entity instance.
   * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
   * @param excludeChildren - Don't recursively build UI for children.
   */
  public addEntity(entity: pc.Entity, folder?: dat.GUI, excludeChildren = false): dat.GUI {
    PcDatGui.openDepth = 0;

    let entityFolder = this.buildEntityUi(entity, folder ?? this.gui);

    return entityFolder;
  }

  /**
   * Add a script component.
   *
   * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
   */
  public addScriptComponent(
    script: pc.ScriptComponent,
    folder: string | dat.GUI,
    open = false,
  ): dat.GUI | undefined {
    if (!folder) {
      throw new Error("No folder reference or name provided.");
    }

    // @ts-expect-error
    let scripts = script._scriptsIndex as {
      [key: string]: {
        instance: pc.ScriptComponent;
      };
    };

    let entries = Object.entries(scripts);

    if (entries.length > 0) {
      let _folder =
        typeof folder === "string" //
          ? this.gui.addFolder(folder)
          : folder;

      entries.forEach((el, i) => {
        let scriptKey = el[0];
        let scriptObject = el[1];

        let scriptFolder = this.addScriptInstance(scriptObject.instance, scriptKey, _folder);

        if (open) {
          scriptFolder.open();
        }
      });

      if (open) {
        _folder.open();
      }

      return _folder;
    }
  }

  /**
   * Add a script instance.
   *
   * @param instance - Script instance.
   * @param key - Script instance name.
   * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
   * @param excludeKeys - Optional array of keys to exclude.
   */
  public addScriptInstance(
    instance: pc.ScriptComponent,
    key: string,
    folder: dat.GUI = this.gui,
    excludeKeys: string[] = [],
  ): dat.GUI {
    if (!key) {
      throw new Error("No key provided.");
    }

    let _folder = folder.addFolder(key);

    // @ts-expect-error
    let attributes = instance.__scriptType?.attributes?.index as {
      [key: string]: Attribute;
    };

    if (attributes) {
      Object.entries(attributes).forEach((el) => {
        let attrKey = el[0];
        let attrConfig = el[1];
        let c;

        // Unsupported
        if (attrConfig.array) return;
        if (attrConfig.enum) return;

        if (!excludeKeys.includes(attrKey)) {
          // @ts-ignore
          let attr: any = instance[attrKey];

          switch (attrConfig.type) {
            case "boolean":
            case "string":
              c = _folder.add(instance, attrKey);
              c.name(attrConfig.title ?? attrKey);
              c.listen();
              break;

            case "number":
              c = _folder.add(instance, attrKey);
              c.name(attrConfig.title ?? attrKey);
              if (typeof attrConfig.min === "number" && typeof attrConfig.max === "number") {
                c.min(attrConfig.min);
                c.max(attrConfig.max);
              }
              c.step(0.01);
              c.listen();
              break;

            case "rgb":
              let rgbFolder = _folder.addFolder(attrConfig.title ?? attrKey);
              rgbFolder.add(attr, "r").min(0).max(1).listen();
              rgbFolder.add(attr, "g").min(0).max(1).listen();
              rgbFolder.add(attr, "b").min(0).max(1).listen();
              break;

            case "rgba":
              let rgbaFolder = _folder.addFolder(attrConfig.title ?? attrKey);
              rgbaFolder.add(attr, "r").min(0).max(1).listen();
              rgbaFolder.add(attr, "g").min(0).max(1).listen();
              rgbaFolder.add(attr, "b").min(0).max(1).listen();
              rgbaFolder.add(attr, "a").min(0).max(1).listen();
              break;

            case "vec2":
              let vec2Folder = _folder.addFolder(attrConfig.title ?? attrKey);
              vec2Folder.add(attr, "x").step(0.01).listen();
              vec2Folder.add(attr, "y").step(0.01).listen();
              break;

            case "vec3":
              let vec3Folder = _folder.addFolder(attrConfig.title ?? attrKey);
              vec3Folder.add(attr, "x").step(0.01).listen();
              vec3Folder.add(attr, "y").step(0.01).listen();
              vec3Folder.add(attr, "z").step(0.01).listen();
              break;
          }
        }
      });
    }

    return _folder;
  }

  /**
   * Build a set of dat.gui controllers from an entity instance.
   *
   * @param entity - Entity instance.
   * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
   * @param excludeChildren - Don't recursively build UI for children.
   */
  private buildEntityUi(entity: pc.Entity, folder?: dat.GUI, excludeChildren = false): dat.GUI {
    let entityFolder = (folder ?? this.gui).addFolder(entity.name);

    let transformFolder = entityFolder.addFolder("transform");

    let positionFolder = transformFolder.addFolder("position");
    let position = new PositionBinder(entity, positionFolder);

    let rotationFolder = transformFolder.addFolder("rotation");
    let rotation = new RotationBinder(entity, rotationFolder);

    let scaleFolder = transformFolder.addFolder("scale");
    let scale = new ScaleBinder(entity, scaleFolder);

    if (entity.script) {
      this.addScriptComponent(entity.script, entityFolder, PcDatGui.openDepth === 0);
    }

    if (PcDatGui.openDepth === 0) {
      entityFolder.open();
    }

    let children = entity.children.filter((el) => el instanceof pc.Entity);

    if (!excludeChildren && children && children.length > 0) {
      let childrenFolder = entityFolder.addFolder("children");
      entity.children.forEach((el) => {
        PcDatGui.openDepth++;
        if (el instanceof pc.Entity) {
          this.buildEntityUi(el, childrenFolder);
        }
      });
    }

    return entityFolder;
  }

  /**
   * Select callback.
   *
   * @param event
   */
  private onSelect(event: MouseEvent) {
    if (
      this.open &&
      this.selectionMode &&
      (event as any).event.srcElement === this.app.graphicsDevice.canvas
    ) {
      let canvas = this.app.graphicsDevice.canvas;
      let w = Math.floor(canvas.clientWidth);
      let h = Math.floor(canvas.clientHeight);
      let camera = this.cameraEntity.camera;
      let scene = this.app.scene;
      let picker = this.picker;

      picker.prepare(camera, scene);

      var selected = picker.getSelection(
        Math.floor(event.x * (picker.width / w)),
        Math.floor(event.y * (picker.height / h)),
      );

      this.clear();

      if (selected.length > 0 && typeof selected[0] !== "undefined") {
        var entity = selected[0].node;

        while (!(entity instanceof pc.Entity) && entity !== null) {
          entity = entity.parent;
        }

        if (entity && entity instanceof pc.Entity) {
          this.selectEntity(entity);
        }
      }
    }
  }

  /**
   * Key event listener callback.
   *
   * @param event
   */
  private onKeyDown(event: pc.KeyboardEvent) {
    if (this.keyCommandsEnabled) {
      if (this.requireAltKey && !this.app.keyboard.isPressed(pc.KEY_ALT)) {
        return;
      }

      if (event.key === pc.KEY_P) {
        if (this.selectedEntity && this.selectedEntity.parent instanceof pc.Entity) {
          this.clear();
          this.selectEntity(this.selectedEntity.parent);
        }
      }

      if (event.key === pc.KEY_O) {
        this.open = !this.open;
      }

      if (event.key === pc.KEY_I) {
        this.selectionMode = !this.selectionMode;
      }
    }
  }
}

// Register script copmonent.
pc.registerScript(PcDatGui, "pcDatGui");

export interface PcDatGui {
  /**
   * Toggle menus.
   */
  open: boolean;
}
PcDatGui.attributes.add("open", {
  description: "Toggle menus.",
  title: "Open",
  type: "boolean",
  default: true,
});

export interface PcDatGui {
  /**
   * Menu opacity.
   */
  opacity: number;
}
PcDatGui.attributes.add("opacity", {
  description: "Menu opacity.",
  title: "Opacity",
  type: "number",
  min: 0.1,
  max: 1,
  default: 0.75,
});

export interface PcDatGui {
  /**
   * Panel width.
   */
  width: number;
}
PcDatGui.attributes.add("width", {
  description: "Panel width.",
  title: "Width",
  type: "number",
  min: 100,
  max: 400,
  default: 200,
});

export interface PcDatGui {
  /**
   * Set menu content by selection.
   */
  selectionMode: boolean;
}
PcDatGui.attributes.add("selectionMode", {
  description: "Set menu content by selection.",
  title: "Selection Mode",
  type: "boolean",
  default: false,
});

export interface PcDatGui {
  /**
   * Enable/disable key commands.
   */
  keyCommandsEnabled: boolean;
}
PcDatGui.attributes.add("keyCommandsEnabled", {
  description: "Enable/disable key commands.",
  title: "Key Commands",
  type: "boolean",
  default: true,
});

export interface PcDatGui {
  /**
   * Require the alt key to be pressed for keyboard shortcuts.
   */
  requireAltKey: boolean;
}
PcDatGui.attributes.add("requireAltKey", {
  description: "Require the alt key to be pressed for keyboard shortcuts.",
  title: "Require Alt Key",
  type: "boolean",
  default: true,
});

export interface PcDatGui {
  /**
   * Specify if you want to use selection mode and have more than one camera in scene.
   */
  cameraEntity: pc.Entity;
}
PcDatGui.attributes.add("cameraEntity", {
  description: "Specify if you want to use selection mode and have more than one camera in scene.",
  title: "Camera Entity",
  type: "entity",
});

/**
 * @internal
 */
class PositionBinder {
  private target: pc.Entity;

  get x() {
    return this.target.getPosition().x;
  }

  set x(value: number) {
    let { x, y, z } = this.target.getPosition();
    this.target.setPosition(value, y, z);
  }

  get y() {
    return this.target.getPosition().y;
  }

  set y(value: number) {
    let { x, y, z } = this.target.getPosition();
    this.target.setPosition(x, value, z);
  }

  get z() {
    return this.target.getPosition().z;
  }

  set z(value: number) {
    let { x, y, z } = this.target.getPosition();
    this.target.setPosition(x, y, value);
  }

  constructor(target: pc.Entity, folder: dat.GUI) {
    this.target = target;
    folder.add(this, "x").step(0.01).listen();
    folder.add(this, "y").step(0.01).listen();
    folder.add(this, "z").step(0.01).listen();
  }
}

/**
 * @internal
 */
class RotationBinder {
  private target: pc.Entity;
  private x: number = 0;
  private y: number = 0;
  private z: number = 0;

  constructor(target: pc.Entity, folder: dat.GUI) {
    this.target = target;

    let { x, y, z } = this.target.getLocalEulerAngles();
    (this.x = x), (this.y = y), (this.z = z);

    folder
      .add(this, "x")
      .step(1)
      .min(-180)
      .max(180)
      .onFinishChange((value) => {
        let { x, y, z } = this.target.getLocalEulerAngles();
        this.target.setLocalEulerAngles(value, y, z);
        (this.x = value), (this.y = y), (this.z = z);
      })
      .listen();

    folder
      .add(this, "y")
      .step(1)
      .min(-180)
      .max(180)
      .onFinishChange((value) => {
        let { x, y, z } = this.target.getLocalEulerAngles();
        this.target.setLocalEulerAngles(x, value, z);
        (this.x = x), (this.y = value), (this.z = z);
      })
      .listen();

    folder
      .add(this, "z")
      .step(1)
      .min(-180)
      .max(180)
      .onFinishChange((value) => {
        let { x, y, z } = this.target.getLocalEulerAngles();
        this.target.setLocalEulerAngles(x, y, value);
        (this.x = x), (this.y = y), (this.z = value);
      })
      .listen();
  }
}

/**
 * @internal
 */
class ScaleBinder {
  private target: pc.Entity;

  get x() {
    return this.target.getLocalScale().x;
  }

  set x(value: number) {
    let { x, y, z } = this.target.getLocalScale();
    this.target.setLocalScale(value, y, z);
  }

  get y() {
    return this.target.getLocalScale().y;
  }

  set y(value: number) {
    let { x, y, z } = this.target.getLocalScale();
    this.target.setLocalScale(x, value, z);
  }

  get z() {
    return this.target.getLocalScale().z;
  }

  set z(value: number) {
    let { x, y, z } = this.target.getLocalScale();
    this.target.setLocalScale(x, y, value);
  }

  constructor(target: pc.Entity, folder: dat.GUI) {
    this.target = target;
    folder.add(this, "x").step(0.01).listen();
    folder.add(this, "y").step(0.01).listen();
    folder.add(this, "z").step(0.01).listen();
  }
}

/**
 * @internal
 */
interface Attribute {
  type:
    | "boolean"
    | "number"
    | "string"
    | "json"
    | "asset"
    | "entity"
    | "rgb"
    | "rgba"
    | "vec2"
    | "vec3"
    | "vec4"
    | "curve";

  default?: any;
  title?: string;
  description?: string;
  placeholder?: string | string[];
  array?: boolean;
  size?: number;
  min?: number;
  max?: number;
  precision?: number;
  step?: number;
  assetType?: string;
  curves?: string[];
  color?: string;
  enum?: object[];
  schema?: object[];
}
