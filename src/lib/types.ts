/**
 * Generic list item shape for UI components.
 * Page maps from domain model (e.g. movie) to this shape.
 */
export interface ListEntry {
	id: number | string;
	title: string;
	year?: number | null;
	favorite?: boolean;
	poster_path?: string | null;
	watched?: boolean;
}

/**
 * Hidden form field for an action (e.g. id).
 */
export interface HiddenField {
	name: string;
	value: string | number;
}

/**
 * Icon component type (e.g. lucide-svelte icons).
 * Uses loose typing to support both Svelte and lucide-svelte component signatures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IconComponent = any;

/**
 * One actionable button in a list row (e.g. "Mark as watched", "Remove").
 */
export interface ListItemAction {
	formAction: string;
	method?: 'post';
	hiddenFields: HiddenField[];
	label: string;
	ariaLabel?: string;
	icon: IconComponent;
	iconOnly?: boolean;
}

/**
 * Action config for the favorite/star toggle in a list row.
 * Same shape as a minimal action; list item uses item.favorite for state.
 */
export interface FavoriteAction {
	formAction: string;
	method?: 'post';
	hiddenFields: HiddenField[];
	ariaLabel: string;
	icon: IconComponent;
}
