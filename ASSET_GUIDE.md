# DentalWeb — 3D Asset Guide

How to prepare and register your Blender models so they appear on DentalWeb.

This guide covers everything between "I have a `.blend` file" and "your model
is live on the site".

---

## 1. Where things live

```
public/
  models/
    dental-chair/
      dental-chair.glb          ← your final chair model
    phantom-head/
      phantom-head.glb          ← your final phantom head model
    teeth/
      tooth.glb                 ← a single tooth model (optional)
    rooms/
      dummy-head-lab-blueprint.svg   ← extracted room plan (already present)
    equipment/                       ← other equipment models

  images/
    hero/            facility photography for hero media
    facilities/      facility cover photography
    equipment/       equipment photography
    placeholders/    static posters used when WebGL or a model fails
```

The registry that points at these files lives at:

```
src/lib/3d/assets.ts
```

**You do not need to touch any scene, component or page code.** Changing a
path in the registry is enough to swap a model.

---

## 2. Export format

### Required format: GLB (glTF 2.0 binary)

Export a single `.glb` file per model. It must contain:

| Requirement | Value |
|---|---|
| Format | glTF 2.0 binary (`.glb`) |
| Meshes | Real geometry only — no modifier stacks, no hidden template objects |
| Materials | PBR (Principled BSDF) with real-world scale textures |
| Textures | Embedded in the `.glb` (or referenced from `public/models/<name>/textures/`) |
| Scale | 1 Blender unit = 1 metre |
| Up axis | Blender's default `Z up` is converted on export to glTF's `Y up` — export with **+Y Up** enabled |
| Origin | Object origin at the base centre of the model (see §3) |

### Blender export settings

`File → Export → glTF 2.0 (.glb/.gltf)`

**Include tab**

- `Selected Objects` — export only the visible, intentional meshes.
- `Include > Cameras` — **off**
- `Include > Lights` — **off** (DentalWeb supplies its own lighting rig)
- `Include > Animations` — **off** unless the model genuinely needs an animation
- `Apply Modifiers` — **on** (so bevels and subsurf are baked into the mesh)
- `UVs` — **on**
- `Normals` — **on**
- `Tangents` — **off** unless you use normal maps with mirrored UVs
- `Vertex Colors` — **off** unless needed

**Data tab**

- `Animation → Sample Animations` — n/a
- `Force 32-bit Indices` — **on** only if the model exceeds 65k vertices

**Geometry tab**

- `Draco Mesh Compression` — **on**, compression level 6 (good ratio, fast decode)
- `Meshopt` — alternative to Draco; pick **one**, not both
- `Simplify` — **off**; simplify beforehand in Blender if needed

---

## 3. Scale and orientation

**Scale.** Author the model at real-world size. A dental chair is roughly
1.9 m long, 0.9 m wide and 1.1 m tall. A phantom head on its stand is roughly
0.5 m tall. If you model at 1 unit = 1 cm instead, scale the root object by
`0.01` before export — do not fix it in the viewer.

**Orientation.** Export with `+Y Up`. Then:

- **Dental chair** — the chair should face down **−Z**, with the headrest at
  **+Z** and the footrest at **−Z**. The backrest tilts back toward **+Z**.
- **Phantom head** — the mannequin faces **+Z** (toward the viewer), with the
  neck mount at the bottom of the head.

The scene cameras look at the origin from the **+X +Z** quadrant, so a model
facing **+Z** is presented three-quarter view.

**Origin.** Put the object origin at the bottom centre of the model, on the
floor plane (`Z = 0` in Blender). DentalWeb grounds the model on the floor
automatically, so an origin at the base means no floating and no clipping.

**Validation checklist before export**

- [ ] Model is centred on the world origin in X and Y
- [ ] Lowest point of the model sits at `Z = 0`
- [ ] `Object → Apply → Rotation` and `Scale` on the root object
- [ ] Real-world dimensions confirmed with the scene ruler
- [ ] No stray hidden objects included

---

## 4. Materials and textures

Use **Principled BSDF** for every material.

| Material | Base colour | Roughness | Metallic | Notes |
|---|---|---|---|---|
| Upholstery (chair seat, headrest) | off-white or sage | 0.55 – 0.7 | 0 | Subtle fabric normal map |
| Chair body / shell | warm white | 0.35 – 0.5 | 0 | Slight clearcoat if you want it |
| Metal (arms, column, fittings) | neutral | 0.25 – 0.4 | 0.85 – 1.0 | Needs an environment to read correctly |
| Rubber / dark plastic | graphite | 0.6 – 0.8 | 0 | |
| Typodont teeth | off-white | 0.3 | 0 | Slight translucency is fine |

**Texture rules**

- Use **PBR metallic-roughness** workflow. Do not bake lighting into albedo.
- Keep the colour space correct: albedo = sRGB, roughness/metallic/normal = linear.
- Texture resolution: **2048 px** on the largest hero surfaces, **1024 px**
  elsewhere, **512 px** for small parts.
- Use **KTX2 / Basis** compression if your pipeline supports it, otherwise
  plain PNG/JPEG is acceptable. The renderer handles both.
- Avoid huge 4K textures on a single chair — you will exceed the mobile
  performance budget for no visible gain.

---

## 5. Naming conventions

Mesh and object names are how you will map interactive parts later.

### General

- `PascalCase` for everything: `DentalChair_Seat`, `DeliveryArm_Body`.
- Prefix every mesh with the asset family so nothing collides:
  `DentalChair_`, `PhantomHead_`, `Room_`.

### Dental chair

| Part | Name |
|---|---|
| Whole chair root | `DentalChair_Root` |
| Seat | `DentalChair_Seat` |
| Backrest | `DentalChair_Backrest` |
| Headrest | `DentalChair_Headrest` |
| Footrest | `DentalChair_Footrest` |
| Left / right armrest | `DentalChair_Armrest_L` / `_R` |
| Delivery arm | `DentalChair_DeliveryArm` |
| Delivery head | `DentalChair_DeliveryHead` |
| Operating light | `DentalChair_OperatingLight` |
| Base / column | `DentalChair_Base` |
| Stool | `DentalChair_Stool` |

### Phantom head

| Part | Name |
|---|---|
| Whole unit root | `PhantomHead_Root` |
| Cranium shell | `PhantomHead_Cranium` |
| Jaw / typodont | `PhantomHead_Typodont` |
| Upper arch teeth | `PhantomHead_Teeth_Upper` |
| Lower arch teeth | `PhantomHead_Teeth_Lower` |
| Neck | `PhantomHead_Neck` |
| Mount clamp | `PhantomHead_Clamp` |
| Bench / counter | `PhantomHead_Bench` |

### Naming rules

- No spaces. No dots except `.001` suffixes Blender adds automatically.
- Keep names under 40 characters.
- Do not rely on Blender's automatic `.001` suffixes — rename before exporting.

---

## 6. Interactive mesh naming

Interactive parts are mapped to backend resource IDs by **name**, never by mesh
index. A future 3D room viewer will look up nodes by name.

For selectable stations in a room model:

```
Room_Station_01
Room_Station_02
Room_Station_03
...
```

Each maps to a real resource id in the database. The mapping table lives in the
application layer, not in the model.

**The single most important rule:** if a mesh is not selectable, it does not need
a special name. If it *is* selectable, its name must be stable across exports.
If you re-export with a renamed node, the mapping breaks — so treat node names
as an API.

---

## 7. Optimisation and compression

Target budgets for the hero model:

| Metric | Desktop target | Hard ceiling |
|---|---|---|
| Triangles | 60,000 | 150,000 |
| Vertices | 60,000 | 150,000 |
| Draw calls | 30 | 80 |
| Material slots | 6 | 12 |
| Texture memory | 24 MB | 48 MB |
| `.glb` file size | 4 MB | 8 MB |

**How to hit them in Blender**

1. Apply modifiers, then check the triangle count in the status bar.
2. Use `Decimate` (collapse) on small, non-hero parts — screws, hoses, cables.
3. Merge small parts that share a material (`Ctrl+J`).
4. Delete hidden geometry and unused materials before export.
5. Use `UV > Smart UV Project` for anything not already unwrapped.
6. In the viewport, set shading to **Rendered** and check that roughness and
   metallic read correctly without a baked environment.

**Mobile**

A single mobile-quality variant is worth producing: roughly half the
triangles, 1024 px textures, same node names. It can be registered as a
separate asset entry and swapped in on low-power devices.

---

## 8. Registering your model

Open `src/lib/3d/assets.ts` and edit the relevant entry:

```ts
export const dentalAssets = {
  dentalChair: {
    label: 'Dental chair',
    src: '/models/dental-chair/dental-chair.glb',   // ← your file
    fallback: '/images/placeholders/dental-chair.svg',
    status: 'approved',                              // was 'placeholder'
    renderMode: 'gltf',                              // ← was 'procedural'
    scale: 1,                                        // leave at 1 for metre-scale models
    rotation: [0, 0, 0],                             // radians
    position: [0, 0, 0],
    normalizeToSize: null,                           // null for metre-scale models
    focus: [0, 0.55, 0],
    camera: {
      position: [2.35, 1.65, 2.75],
      target: [0, 0.5, 0],
      fov: 34,
    },
    lighting: 'studio',
    description: 'A full dental chair with delivery arm and operating light.',
    tint: '#E6E2DA',
  },
} as const
```

### Field reference

| Field | Meaning |
|---|---|
| `src` | Public path to the `.glb`. Set to `null` to fall back to the procedural placeholder. |
| `fallback` | Static poster shown when WebGL is unavailable or the model fails to load. |
| `status` | `placeholder` \| `incoming` \| `approved`. `approved` means it is the real asset. |
| `renderMode` | `procedural` renders the composed placeholder; `gltf` loads `src`. Set to `gltf` when your model is ready. |
| `scale` | Uniform multiplier on top of the model's own units. Keep `1` for metre-scale models. |
| `rotation` | Euler rotation in **radians** `[x, y, z]`. |
| `position` | Model-space offset in metres. |
| `normalizeToSize` | When set, the model is uniformly rescaled so its largest dimension equals this value. Use only if the source file has an arbitrary unit scale. `null` for real-world-metre models. |
| `focus` | The point of interest — used for framing and as the model pivot. |
| `camera` | Camera position, target and field of view in world units. |
| `lighting` | `studio` \| `studio-warm` \| `showcase`. |
| `description` | Accessible description used in the fallback and in `aria` text. |
| `tint` | Colour applied to models that ship without materials. |

### Registering a brand-new model

Add a new key to `dentalAssets`:

```ts
  operatingLight: {
    label: 'Operating light',
    src: '/models/equipment/operating-light.glb',
    fallback: '/images/placeholders/operating-light.svg',
    status: 'approved',
    renderMode: 'gltf',
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    normalizeToSize: null,
    focus: [0, 0.3, 0],
    camera: { position: [1.2, 0.9, 1.4], target: [0, 0.3, 0], fov: 32 },
    lighting: 'studio',
    description: 'An LED operating light on an articulated arm.',
  },
```

Then render it with:

```tsx
<ShowcaseModel asset={getAsset('operatingLight')} procedural="chair" />
```

`getAsset('operatingLight')` is typed, so a typo is a compile error.

---

## 9. Testing your model

### 9.1 In Blender

- [ ] Real-world dimensions verified
- [ ] Origin at the base centre
- [ ] `+Y Up` export enabled
- [ ] Materials are Principled BSDF
- [ ] No baked lighting in the albedo
- [ ] Triangle / texture budgets met

### 9.2 In the browser

1. `npm run dev` and open `http://localhost:3000`.
2. Open the hero. The model should appear centred, correctly proportioned and
   grounded on the floor — not floating, not stretched, not sunk.
3. Scroll through the hero. The camera moves; the model must stay composed.
4. Check the service pages — each product page has its own camera framing.
5. Resize the window. The framing must hold at 1440px, 1024px, 768px, 390px.
6. Turn on `prefers-reduced-motion` in your OS or browser dev tools
   (`Emulate CSS media feature`). The scene must fall back to the static poster
   and every CTA must still work.
7. Open DevTools → Rendering → set the CPU throttling to 4×. The page must stay
   usable.

### 9.3 Quick checklist in the browser

| Check | Expected |
|---|---|
| Model is not stretched | Proportions match a real chair |
| Model is not floating | Base sits on the floor |
| Model is not sunk | Nothing clipped by the floor plane |
| Shadows land correctly | Contact shadow under the base |
| Materials read correctly | No black or white-blown surfaces |
| Fallback poster | Used if WebGL is disabled |
| Main CTA stays visible | Never hidden behind the canvas |

### 9.4 Checking on a phone

- [ ] DevTools → device toolbar → iPhone 15 / Pixel 8
- [ ] Model loads and stays sharp
- [ ] Frame rate holds above 30 fps
- [ ] The scene does not fight with page scroll

### 9.5 Automated composition check

The repository ships a script that projects each asset's bounding box through
its camera and reports screen coverage, grounding and cropping:

```bash
node scripts/check-composition.mjs
```

Update the scene entry in that script when you change a camera framing, so the
check keeps matching the real configuration.

### 9.6 Currently registered placeholders

| Asset | Path | State |
|---|---|---|
| Dental chair | `public/models/dental-chair/dental-chair.glb` | Raw mesh export — no materials, normals or UVs; six disconnected components. Registered, but the composed procedural scene is what renders. |
| Phantom head | `public/models/phantom-head/phantom-head.glb` | Not delivered yet. The composed procedural scene renders. |
| Tooth | `public/models/teeth/tooth.glb` | Raw mesh export — one component, 30,000 triangles, no materials or UVs. Registered for a future 3D viewer. |
| Room | `public/models/rooms/` | No 3D room model. The 2D blueprint is the accurate view. |

The supplied files are usable as a starting point, but the final assets should
be exported properly as described above.

---

## 10. The placeholder strategy (why this is safe)

While your models are in progress, DentalWeb ships with:

- **Procedural placeholder geometry** — deliberately composed, correctly
  proportioned stand-ins used when a `.glb` is absent or fails to load.
- **Static poster images** in `public/images/placeholders/` — used when WebGL
  is unavailable, when reduced motion is requested, or when a model fails.
- **Asset registry entries** with `status: 'placeholder'` — the site always
  labels placeholder content as such.

Consequences you should be aware of:

- A placeholder is **never** presented as final equipment. Posters carry a
  "PLACEHOLDER MODEL — NOT FINAL EQUIPMENT" label and the service showcase
  shows a "Placeholder model" badge.
- **No scene code depends on a temporary model's internal structure.** The
  loader computes normals, repairs missing UVs, applies a fallback material,
  grounds the model and centres it on its own bounding box. It never references
  a mesh index or a specific node name.
- **Swapping in your model cannot break the scene**, because the only contract
  is "a `.glb` at this path, in metres, facing +Z".

---

## 11. Blueprint and room layouts

The supplied room blueprint is the source of truth for station placement. It was
extracted from `dental_dummy_head_lab_blueprint.html` by:

```bash
node scripts/extract-blueprint.mjs
```

This produces:

- `public/models/rooms/dummy-head-lab-blueprint.svg` — the verbatim plan
- `src/components/room/RoomBlueprintSvg.tsx` — the inline React version with
  stable `data-station-id` attributes and a `BLUEPRINT_STATIONS` table

**Station mapping (from the plan itself):**

| Station | Zone |
|---|---|
| PH-01 … PH-07 | Top counter |
| PH-08 … PH-10 | Left wall counter |
| PH-11 … PH-14 | Bottom counter |

If you later produce a 3D room model, name its selectable nodes
`Room_Station_01` … `Room_Station_14` so they map to the same resources as the
2D plan. The 2D plan remains available at all times as the fallback.

---

## 12. Handoff checklist per model

Send these with every model:

- [ ] Source `.blend` file
- [ ] Exported `.glb`
- [ ] Real-world dimensions and unit scale
- [ ] Forward / up axes and origin position
- [ ] Camera framing recommendation (position, target, FOV)
- [ ] Material and texture inventory
- [ ] Polygon and texture budget report
- [ ] Interactive node names, if any
- [ ] Static poster render (SVG or WebP) for the fallback path
- [ ] Mobile quality variant, if produced
- [ ] Licence / ownership confirmation
