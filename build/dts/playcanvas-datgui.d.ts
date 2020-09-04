import * as pc from "playcanvas";
import * as dat from "dat.gui";
/**
 * Some quick and simple bindings between playcanvas and dat.gui for easilly creating interactivity for debugging and example/demos.
 *
 */
export declare class PcDatGui extends pc.ScriptType {
    /**
     * Used to auto-open olders to a certain depth.
     */
    static openDepth: number;
    /**
     * dat.GUI instance.
     */
    gui: dat.GUI;
    /**
     * pc.Picker instance.
     */
    private picker;
    /**
     * Currently selected entity for selection mode.
     */
    private selectedEntity?;
    /**
     * Called when script is about to run for the first time.
     */
    initialize(): void;
    /**
     * Add an entity or script component.
     *
     * @param target - target entity or script component instance.
     * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
     */
    add(target: pc.Entity | pc.ScriptComponent, folder: string | dat.GUI): void;
    /**
     * Clear all.
     */
    clear(): void;
    /**
     * Show the panel.
     */
    show(): void;
    /**
     * Hide the panel.
     */
    hide(): void;
    /**
     * Set the entity selection.
     *
     * @param entity - Target entity instance.
     */
    selectEntity(entity: pc.Entity): void;
    /**
     * Add an entity.
     *
     * @param entity - Entity instance.
     * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
     * @param excludeChildren - Don't recursively build UI for children.
     */
    addEntity(entity: pc.Entity, folder?: dat.GUI, excludeChildren?: boolean): dat.GUI;
    /**
     * Add a script component.
     *
     * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
     */
    addScriptComponent(script: pc.ScriptComponent, folder: string | dat.GUI, open?: boolean): dat.GUI | undefined;
    /**
     * Add a script instance.
     *
     * @param instance - Script instance.
     * @param key - Script instance name.
     * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
     * @param excludeKeys - Optional array of keys to exclude.
     */
    addScriptInstance(instance: pc.ScriptComponent, key: string, folder?: dat.GUI, excludeKeys?: string[]): dat.GUI;
    /**
     * Build a set of dat.gui controllers from an entity instance.
     *
     * @param entity - Entity instance.
     * @param folder - Optional dat.GUI instance to add to. If not provided, root is used.
     * @param excludeChildren - Don't recursively build UI for children.
     */
    private buildEntityUi;
    /**
     * Select callback.
     *
     * @param event
     */
    private onSelect;
    /**
     * Key event listener callback.
     *
     * @param event
     */
    private onKeyDown;
}
export interface PcDatGui {
    /**
     * Toggle menus.
     */
    open: boolean;
}
export interface PcDatGui {
    /**
     * Menu opacity.
     */
    opacity: number;
}
export interface PcDatGui {
    /**
     * Panel width.
     */
    width: number;
}
export interface PcDatGui {
    /**
     * Set menu content by selection.
     */
    selectionMode: boolean;
}
export interface PcDatGui {
    /**
     * Enable/disable key commands.
     */
    keyCommandsEnabled: boolean;
}
export interface PcDatGui {
    /**
     * Require the alt key to be pressed for keyboard shortcuts.
     */
    requireAltKey: boolean;
}
export interface PcDatGui {
    /**
     * Specify if you want to use selection mode and have more than one camera in scene.
     */
    cameraEntity: pc.Entity;
}
