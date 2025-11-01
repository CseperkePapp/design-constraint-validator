import { z } from "zod";
/** ---------- Top-level schema ---------- */
export declare const TokensSchema: z.ZodObject<{
    color: z.ZodObject<{
        palette: z.ZodObject<{
            [x: string]: z.ZodTypeAny;
        }, "strip", z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>>, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>]>, z.objectOutputType<{
            [x: string]: z.ZodTypeAny;
        }, z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>>, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>]>, "strip">, z.objectInputType<{
            [x: string]: z.ZodTypeAny;
        }, z.ZodUnion<[z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>>, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>]>, "strip">>;
        role: z.ZodObject<{
            text: z.ZodOptional<z.ZodObject<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            bg: z.ZodOptional<z.ZodObject<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            accent: z.ZodOptional<z.ZodObject<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            on: z.ZodOptional<z.ZodObject<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            focus: z.ZodOptional<z.ZodObject<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            text: z.ZodOptional<z.ZodObject<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            bg: z.ZodOptional<z.ZodObject<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            accent: z.ZodOptional<z.ZodObject<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            on: z.ZodOptional<z.ZodObject<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            focus: z.ZodOptional<z.ZodObject<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            text: z.ZodOptional<z.ZodObject<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            bg: z.ZodOptional<z.ZodObject<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            accent: z.ZodOptional<z.ZodObject<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            on: z.ZodOptional<z.ZodObject<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
            focus: z.ZodOptional<z.ZodObject<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>;
    }, "strip", z.ZodTypeAny, {
        palette: {
            [x: string]: any;
        } & {
            [k: string]: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | Record<string, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>;
        };
        role: {
            focus?: z.objectOutputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            text?: z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            bg?: z.objectOutputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            accent?: z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            on?: z.objectOutputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
    }, {
        palette: {
            [x: string]: any;
        } & {
            [k: string]: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | Record<string, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>;
        };
        role: {
            focus?: z.objectInputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            text?: z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            bg?: z.objectInputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            accent?: z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            on?: z.objectInputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
    }>;
    size: z.ZodObject<{
        spacing: z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>>;
        radius: z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>>;
        border: z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodObject<{
            $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
            $value: z.ZodAny;
        }, "strip", z.ZodTypeAny, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>>;
    }, "strip", z.ZodTypeAny, {
        radius: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        spacing: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        border: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
    }, {
        radius: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        spacing: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        border: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
    }>;
    typography: z.ZodObject<{
        font: z.ZodObject<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">>;
        size: z.ZodObject<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">>;
        lineHeight: z.ZodObject<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            body: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">>;
    }, "strip", z.ZodTypeAny, {
        lineHeight: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        font: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        size: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    }, {
        lineHeight: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        font: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        size: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    }>;
    motion: z.ZodObject<{
        duration: z.ZodObject<{
            fast: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            fast: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            fast: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">>;
        easing: z.ZodObject<{
            standard: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            standard: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            standard: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                $value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>>;
        }, z.ZodTypeAny, "passthrough">>;
    }, "strip", z.ZodTypeAny, {
        duration: {
            fast?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        easing: {
            standard?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    }, {
        duration: {
            fast?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        easing: {
            standard?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    }>;
    elevation: z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodObject<{
        $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
        $value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
        $value?: any;
    }, {
        $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
        $value?: any;
    }>, {
        $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
        $value?: any;
    }, {
        $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
        $value?: any;
    }>>;
}, "strip", z.ZodTypeAny, {
    typography: {
        lineHeight: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        font: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        size: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    color: {
        palette: {
            [x: string]: any;
        } & {
            [k: string]: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | Record<string, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>;
        };
        role: {
            focus?: z.objectOutputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            text?: z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            bg?: z.objectOutputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            accent?: z.objectOutputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            on?: z.objectOutputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    size: {
        radius: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        spacing: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        border: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
    };
    motion: {
        duration: {
            fast?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        easing: {
            standard?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    elevation: Record<string, {
        $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
        $value?: any;
    }>;
}, {
    typography: {
        lineHeight: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        font: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        size: {
            body?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    color: {
        palette: {
            [x: string]: any;
        } & {
            [k: string]: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | Record<string, {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            }>;
        };
        role: {
            focus?: z.objectInputType<{
                ring: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            text?: z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                muted: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            bg?: z.objectInputType<{
                surface: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            accent?: z.objectInputType<{
                default: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
                hover: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
            on?: z.objectInputType<{
                accent: z.ZodOptional<z.ZodEffects<z.ZodObject<{
                    $type: z.ZodEnum<["color", "dimension", "borderRadius", "fontSize", "shadow", "duration", "easing", "fontFamily", "lineHeight"]>;
                    $value: z.ZodAny;
                }, "strip", z.ZodTypeAny, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }, {
                    $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                    $value?: any;
                }>>;
            }, z.ZodTypeAny, "passthrough"> | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    size: {
        radius: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        spacing: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
        border: Record<string, {
            $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
            $value?: any;
        }>;
    };
    motion: {
        duration: {
            fast?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
        easing: {
            standard?: {
                $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
                $value?: any;
            } | undefined;
        } & {
            [k: string]: unknown;
        };
    };
    elevation: Record<string, {
        $type: "color" | "dimension" | "borderRadius" | "fontSize" | "shadow" | "duration" | "easing" | "fontFamily" | "lineHeight";
        $value?: any;
    }>;
}>;
export type Tokens = z.infer<typeof TokensSchema>;
/** ---------- Example usage ---------- */
//# sourceMappingURL=tokens.schema.d.ts.map