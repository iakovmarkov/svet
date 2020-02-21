import chroma from "chroma-js";

/**
 * Chroma throws an exception if you give it non-valid value
 * This is used to make Chroma safer
 */
export default (color = '#FFFFFF') => chroma(color)