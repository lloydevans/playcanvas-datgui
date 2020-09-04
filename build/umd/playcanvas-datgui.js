(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('playcanvas'), require('dat.gui')) :
    typeof define === 'function' && define.amd ? define(['exports', 'playcanvas', 'dat.gui'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pc = global.pc || {}, global.pc, global.dat));
}(this, (function (exports, pc, dat) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * Some quick and simple bindings between playcanvas and dat.gui for easilly creating interactivity for debugging and example/demos.
     *
     */
    var PcDatGui = /** @class */ (function (_super) {
        __extends(PcDatGui, _super);
        function PcDatGui() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * dat.GUI instance.
             */
            _this.gui = new dat.GUI();
            return _this;
        }
        /**
         * Called when script is about to run for the first time.
         */
        PcDatGui.prototype.initialize = function () {
            var _this = this;
            var _a, _b;
            this.gui.useLocalStorage = false;
            this.picker = new pc.Picker(this.app, 1024, 1024);
            this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onSelect, this);
            this.cameraEntity = (_a = this.cameraEntity) !== null && _a !== void 0 ? _a : this.app.root.findComponent("camera").entity;
            if (!((_b = this.cameraEntity) === null || _b === void 0 ? void 0 : _b.camera)) {
                throw new Error("Can't find camera.");
            }
            this.on("attr:selectionMode", function () {
                _this.clear();
            });
            this.on("attr:width", function () {
                _this.gui.width = _this.width;
            });
            this.on("attr:open", function () {
                if (_this.open) {
                    _this.show();
                } //
                else {
                    _this.hide();
                }
            });
            this.on("attr:opacity", function () {
                _this.gui.domElement.style.opacity = _this.opacity.toString();
            });
            this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
            this.gui.domElement = window.document.getElementsByClassName("main")[0];
            this.gui.domElement.style.webkitTransition = "opacity 0.5s;";
            this.gui.domElement.style.transition = "opacity 0.5s;";
            // Trigger update events once on init.
            this.opacity = this.opacity;
            this.width = this.width;
            this.open = this.open;
        };
        /**
         * Add an entity or script component.
         *
         * @param target - target entity or script component instance.
         * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
         */
        PcDatGui.prototype.add = function (target, folder) {
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
        };
        /**
         * Clear all.
         */
        PcDatGui.prototype.clear = function () {
            var _this = this;
            Object.values(this.gui.__folders).forEach(function (el) {
                _this.gui.removeFolder(el);
            });
        };
        /**
         * Show the panel.
         */
        PcDatGui.prototype.show = function () {
            if (this.gui.domElement.style.display === "none") {
                this.gui.domElement.style.display = "";
                this.gui.open();
            }
        };
        /**
         * Hide the panel.
         */
        PcDatGui.prototype.hide = function () {
            if (this.gui.domElement.style.display === "") {
                this.gui.domElement.style.display = "none";
                this.gui.close();
                this.clear();
            }
        };
        /**
         * Set the entity selection.
         *
         * @param entity - Target entity instance.
         */
        PcDatGui.prototype.selectEntity = function (entity) {
            this.selectedEntity = entity;
            this.addEntity(entity);
        };
        /**
         * Add an entity.
         *
         * @param entity - Entity instance.
         * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
         * @param excludeChildren - Don't recursively build UI for children.
         */
        PcDatGui.prototype.addEntity = function (entity, folder, excludeChildren) {
            PcDatGui.openDepth = 0;
            var entityFolder = this.buildEntityUi(entity, folder !== null && folder !== void 0 ? folder : this.gui);
            return entityFolder;
        };
        /**
         * Add a script component.
         *
         * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
         */
        PcDatGui.prototype.addScriptComponent = function (script, folder, open) {
            var _this = this;
            if (open === void 0) { open = false; }
            if (!folder) {
                throw new Error("No folder reference or name provided.");
            }
            // @ts-expect-error
            var scripts = script._scriptsIndex;
            var entries = Object.entries(scripts);
            if (entries.length > 0) {
                var _folder_1 = typeof folder === "string" //
                    ? this.gui.addFolder(folder)
                    : folder;
                entries.forEach(function (el, i) {
                    var scriptKey = el[0];
                    var scriptObject = el[1];
                    var scriptFolder = _this.addScriptInstance(scriptObject.instance, scriptKey, _folder_1);
                    if (open) {
                        scriptFolder.open();
                    }
                });
                if (open) {
                    _folder_1.open();
                }
                return _folder_1;
            }
        };
        /**
         * Add a script instance.
         *
         * @param instance - Script instance.
         * @param key - Script instance name.
         * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
         * @param excludeKeys - Optional array of keys to exclude.
         */
        PcDatGui.prototype.addScriptInstance = function (instance, key, folder, excludeKeys) {
            var _a, _b;
            if (folder === void 0) { folder = this.gui; }
            if (excludeKeys === void 0) { excludeKeys = []; }
            if (!key) {
                throw new Error("No key provided.");
            }
            var _folder = folder.addFolder(key);
            // @ts-expect-error
            var attributes = (_b = (_a = instance.__scriptType) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.index;
            if (attributes) {
                Object.entries(attributes).forEach(function (el) {
                    var _a, _b, _c, _d, _e, _f;
                    var attrKey = el[0];
                    var attrConfig = el[1];
                    var c;
                    // Unsupported
                    if (attrConfig.array)
                        return;
                    if (attrConfig.enum)
                        return;
                    if (!excludeKeys.includes(attrKey)) {
                        // @ts-ignore
                        var attr = instance[attrKey];
                        switch (attrConfig.type) {
                            case "boolean":
                            case "string":
                                c = _folder.add(instance, attrKey);
                                c.name((_a = attrConfig.title) !== null && _a !== void 0 ? _a : attrKey);
                                c.listen();
                                break;
                            case "number":
                                c = _folder.add(instance, attrKey);
                                c.name((_b = attrConfig.title) !== null && _b !== void 0 ? _b : attrKey);
                                if (typeof attrConfig.min === "number" && typeof attrConfig.max === "number") {
                                    c.min(attrConfig.min);
                                    c.max(attrConfig.max);
                                }
                                c.step(0.01);
                                c.listen();
                                break;
                            case "rgb":
                                var rgbFolder = _folder.addFolder((_c = attrConfig.title) !== null && _c !== void 0 ? _c : attrKey);
                                rgbFolder.add(attr, "r").min(0).max(1).listen();
                                rgbFolder.add(attr, "g").min(0).max(1).listen();
                                rgbFolder.add(attr, "b").min(0).max(1).listen();
                                break;
                            case "rgba":
                                var rgbaFolder = _folder.addFolder((_d = attrConfig.title) !== null && _d !== void 0 ? _d : attrKey);
                                rgbaFolder.add(attr, "r").min(0).max(1).listen();
                                rgbaFolder.add(attr, "g").min(0).max(1).listen();
                                rgbaFolder.add(attr, "b").min(0).max(1).listen();
                                rgbaFolder.add(attr, "a").min(0).max(1).listen();
                                break;
                            case "vec2":
                                var vec2Folder = _folder.addFolder((_e = attrConfig.title) !== null && _e !== void 0 ? _e : attrKey);
                                vec2Folder.add(attr, "x").step(0.01).listen();
                                vec2Folder.add(attr, "y").step(0.01).listen();
                                break;
                            case "vec3":
                                var vec3Folder = _folder.addFolder((_f = attrConfig.title) !== null && _f !== void 0 ? _f : attrKey);
                                vec3Folder.add(attr, "x").step(0.01).listen();
                                vec3Folder.add(attr, "y").step(0.01).listen();
                                vec3Folder.add(attr, "z").step(0.01).listen();
                                break;
                        }
                    }
                });
            }
            return _folder;
        };
        /**
         * Build a set of dat.gui controllers from an entity instance.
         *
         * @param entity - Entity instance.
         * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
         * @param excludeChildren - Don't recursively build UI for children.
         */
        PcDatGui.prototype.buildEntityUi = function (entity, folder, excludeChildren) {
            var _this = this;
            if (excludeChildren === void 0) { excludeChildren = false; }
            var entityFolder = (folder !== null && folder !== void 0 ? folder : this.gui).addFolder(entity.name);
            var transformFolder = entityFolder.addFolder("transform");
            var positionFolder = transformFolder.addFolder("position");
            var position = new PositionBinder(entity, positionFolder);
            var rotationFolder = transformFolder.addFolder("rotation");
            var rotation = new RotationBinder(entity, rotationFolder);
            var scaleFolder = transformFolder.addFolder("scale");
            var scale = new ScaleBinder(entity, scaleFolder);
            if (entity.script) {
                this.addScriptComponent(entity.script, entityFolder, PcDatGui.openDepth === 0);
            }
            if (PcDatGui.openDepth === 0) {
                entityFolder.open();
            }
            var children = entity.children.filter(function (el) { return el instanceof pc.Entity; });
            if (!excludeChildren && children && children.length > 0) {
                var childrenFolder_1 = entityFolder.addFolder("children");
                entity.children.forEach(function (el) {
                    PcDatGui.openDepth++;
                    if (el instanceof pc.Entity) {
                        _this.buildEntityUi(el, childrenFolder_1);
                    }
                });
            }
            return entityFolder;
        };
        /**
         * Select callback.
         *
         * @param event
         */
        PcDatGui.prototype.onSelect = function (event) {
            if (this.open &&
                this.selectionMode &&
                event.event.srcElement === this.app.graphicsDevice.canvas) {
                var canvas = this.app.graphicsDevice.canvas;
                var w = Math.floor(canvas.clientWidth);
                var h = Math.floor(canvas.clientHeight);
                var camera = this.cameraEntity.camera;
                var scene = this.app.scene;
                var picker = this.picker;
                picker.prepare(camera, scene);
                var selected = picker.getSelection(Math.floor(event.x * (picker.width / w)), Math.floor(event.y * (picker.height / h)));
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
        };
        /**
         * Key event listener callback.
         *
         * @param event
         */
        PcDatGui.prototype.onKeyDown = function (event) {
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
        };
        /**
         * Used to auto-open olders to a certain depth.
         */
        PcDatGui.openDepth = 0;
        return PcDatGui;
    }(pc.ScriptType));
    // Register script copmonent.
    pc.registerScript(PcDatGui, "pcDatGui");
    PcDatGui.attributes.add("open", {
        description: "Toggle menus.",
        title: "Open",
        type: "boolean",
        default: true,
    });
    PcDatGui.attributes.add("opacity", {
        description: "Menu opacity.",
        title: "Opacity",
        type: "number",
        min: 0.1,
        max: 1,
        default: 0.75,
    });
    PcDatGui.attributes.add("width", {
        description: "Panel width.",
        title: "Width",
        type: "number",
        min: 100,
        max: 400,
        default: 200,
    });
    PcDatGui.attributes.add("selectionMode", {
        description: "Set menu content by selection.",
        title: "Selection Mode",
        type: "boolean",
        default: false,
    });
    PcDatGui.attributes.add("keyCommandsEnabled", {
        description: "Enable/disable key commands.",
        title: "Key Commands",
        type: "boolean",
        default: true,
    });
    PcDatGui.attributes.add("requireAltKey", {
        description: "Require the alt key to be pressed for keyboard shortcuts.",
        title: "Require Alt Key",
        type: "boolean",
        default: true,
    });
    PcDatGui.attributes.add("cameraEntity", {
        description: "Specify if you want to use selection mode and have more than one camera in scene.",
        title: "Camera Entity",
        type: "entity",
    });
    /**
     * @internal
     */
    var PositionBinder = /** @class */ (function () {
        function PositionBinder(target, folder) {
            this.target = target;
            folder.add(this, "x").step(0.01).listen();
            folder.add(this, "y").step(0.01).listen();
            folder.add(this, "z").step(0.01).listen();
        }
        Object.defineProperty(PositionBinder.prototype, "x", {
            get: function () {
                return this.target.getPosition().x;
            },
            set: function (value) {
                var _a = this.target.getPosition(), x = _a.x, y = _a.y, z = _a.z;
                this.target.setPosition(value, y, z);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PositionBinder.prototype, "y", {
            get: function () {
                return this.target.getPosition().y;
            },
            set: function (value) {
                var _a = this.target.getPosition(), x = _a.x, y = _a.y, z = _a.z;
                this.target.setPosition(x, value, z);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PositionBinder.prototype, "z", {
            get: function () {
                return this.target.getPosition().z;
            },
            set: function (value) {
                var _a = this.target.getPosition(), x = _a.x, y = _a.y, z = _a.z;
                this.target.setPosition(x, y, value);
            },
            enumerable: false,
            configurable: true
        });
        return PositionBinder;
    }());
    /**
     * @internal
     */
    var RotationBinder = /** @class */ (function () {
        function RotationBinder(target, folder) {
            var _this = this;
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.target = target;
            var _a = this.target.getLocalEulerAngles(), x = _a.x, y = _a.y, z = _a.z;
            (this.x = x), (this.y = y), (this.z = z);
            folder
                .add(this, "x")
                .step(1)
                .min(-180)
                .max(180)
                .onFinishChange(function (value) {
                var _a = _this.target.getLocalEulerAngles(), x = _a.x, y = _a.y, z = _a.z;
                _this.target.setLocalEulerAngles(value, y, z);
                (_this.x = value), (_this.y = y), (_this.z = z);
            })
                .listen();
            folder
                .add(this, "y")
                .step(1)
                .min(-180)
                .max(180)
                .onFinishChange(function (value) {
                var _a = _this.target.getLocalEulerAngles(), x = _a.x, y = _a.y, z = _a.z;
                _this.target.setLocalEulerAngles(x, value, z);
                (_this.x = x), (_this.y = value), (_this.z = z);
            })
                .listen();
            folder
                .add(this, "z")
                .step(1)
                .min(-180)
                .max(180)
                .onFinishChange(function (value) {
                var _a = _this.target.getLocalEulerAngles(), x = _a.x, y = _a.y, z = _a.z;
                _this.target.setLocalEulerAngles(x, y, value);
                (_this.x = x), (_this.y = y), (_this.z = value);
            })
                .listen();
        }
        return RotationBinder;
    }());
    /**
     * @internal
     */
    var ScaleBinder = /** @class */ (function () {
        function ScaleBinder(target, folder) {
            this.target = target;
            folder.add(this, "x").step(0.01).listen();
            folder.add(this, "y").step(0.01).listen();
            folder.add(this, "z").step(0.01).listen();
        }
        Object.defineProperty(ScaleBinder.prototype, "x", {
            get: function () {
                return this.target.getLocalScale().x;
            },
            set: function (value) {
                var _a = this.target.getLocalScale(), x = _a.x, y = _a.y, z = _a.z;
                this.target.setLocalScale(value, y, z);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ScaleBinder.prototype, "y", {
            get: function () {
                return this.target.getLocalScale().y;
            },
            set: function (value) {
                var _a = this.target.getLocalScale(), x = _a.x, y = _a.y, z = _a.z;
                this.target.setLocalScale(x, value, z);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ScaleBinder.prototype, "z", {
            get: function () {
                return this.target.getLocalScale().z;
            },
            set: function (value) {
                var _a = this.target.getLocalScale(), x = _a.x, y = _a.y, z = _a.z;
                this.target.setLocalScale(x, y, value);
            },
            enumerable: false,
            configurable: true
        });
        return ScaleBinder;
    }());

    exports.PcDatGui = PcDatGui;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
