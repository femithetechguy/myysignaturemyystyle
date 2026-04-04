"""
seed-services.py
Builds data/services.json from the official service list.
Run from the project root: python3 scripts/seed-services.py
"""

import json
import os
import pandas as pd

services = [
    # ── Hair Cut ──────────────────────────────────────────────────────────
    ("cut_001",    "Hair Trim",                        "Clean-up trim to remove split ends and maintain shape",                         60,  30,  45,  "Hair Cut"),
    ("cut_002",    "Bang / Edge Trim",                 "Precision trim of bangs and edges for a polished finish",                       60,  50,  65,  "Hair Cut"),
    ("cut_003",    "Haircut",                          "Full haircut with expert shaping and styling",                                  60,  65,  85,  "Hair Cut"),

    # ── Chemical Service ──────────────────────────────────────────────────
    ("chem_001",   "Relaxer / Texturizer",             "Chemical straightening or light texture softening service",                    120,  80, 130,  "Chemical Service"),
    ("chem_002",   "Perm",                             "Chemical wave or curl perm service",                                          120, 100, 150,  "Chemical Service"),
    ("chem_003",   "Grey Coverage",                    "Full grey coverage color application",                                         90,  75, 110,  "Chemical Service"),
    ("chem_004",   "Root Touchup",                     "Color refresh and root touch-up application",                                  90,  60,  95,  "Chemical Service"),
    ("chem_005",   "Single Process Color",             "One all-over color application",                                              120,  85, 130,  "Chemical Service"),
    ("chem_006",   "Double Process Color",             "Two-step color process — lift and tone",                                      180, 130, 190,  "Chemical Service"),
    ("chem_007",   "Partial / Full Highlight",         "Partial or full foil highlights for dimension and brightness",                120, 100, 160,  "Chemical Service"),

    # ── Hair Treatment ────────────────────────────────────────────────────
    ("treat_001",  "Deep Conditioning Treatment",      "Intensive moisture replenishment for dry or damaged hair",                     30,  35,  55,  "Hair Treatment"),
    ("treat_002",  "Protein Treatment",                "Strengthening protein treatment to restore hair integrity",                    30,  35,  60,  "Hair Treatment"),
    ("treat_003",  "Oil Treatment",                    "Nourishing hot oil treatment for shine and softness",                         30,  30,  50,  "Hair Treatment"),
    ("treat_004",  "Scalp Treatment",                  "Therapeutic scalp treatment targeting dryness or buildup",                    45,  40,  65,  "Hair Treatment"),
    ("treat_005",  "Olaplex / Bond Repair Treatment",  "Bond-building treatment to repair chemically or heat-damaged hair",           45,  50,  85,  "Hair Treatment"),
    ("treat_006",  "Dr C Tuna Hair Treatment",         "Farmasi Dr C Tuna restorative hair and scalp care treatment",                 45,  50,  80,  "Hair Treatment"),

    # ── Extensions ────────────────────────────────────────────────────────
    ("ext_001",    "Sew-In",                           "Full sew-in weave installation with natural hair braided down",               180, 175, 260,  "Extensions"),
    ("ext_002",    "Microlinks",                       "Individual microlink / I-tip extension installation",                        240, 200, 350,  "Extensions"),
    ("ext_003",    "Tape In",                          "Tape-in weft extension application",                                         180, 150, 250,  "Extensions"),
    ("ext_004",    "Wig Installation",                 "Custom wig fitting, glueless or adhesive installation",                      180,  80, 150,  "Extensions"),
    ("ext_005",    "Up Do",                            "Elegant pinned or swept-up style with extensions",                           120,  75, 130,  "Extensions"),
    ("ext_006",    "Pixie Natural Hair / Sew-In",      "Pixie cut style achieved with natural hair or sew-in technique",             180, 150, 220,  "Extensions"),
    ("ext_007",    "Weave Maintenance",                "Upkeep, tightening, and care for existing weave installation",                60,  60, 100,  "Extensions"),
    ("ext_008",    "Weave Take Down",                  "Safe removal of weave and gentle detangle of natural hair",                   45,  40,  75,  "Extensions"),

    # ── Braids ────────────────────────────────────────────────────────────
    ("braid_001",  "Feeding / Fulani / Lemonade Braids","Feed-in, Fulani, or lemonade braid styles with extensions",                 180, 150, 260,  "Braids"),
    ("braid_002",  "Senegalese Twist",                 "Rope twist style using Kanekalon or Marley hair",                            180, 150, 230,  "Braids"),
    ("braid_003",  "Crochet",                          "Crochet braid installation with various hair textures",                      120, 100, 180,  "Braids"),
    ("braid_004",  "Braids Maintenance",               "Re-do edges, moisturize, and maintain existing braid style",                 120,  75, 130,  "Braids"),
    ("braid_005",  "Braids Take Down",                 "Careful removal of braids with detangle and wash option",                     60,  50,  80,  "Braids"),

    # ── Locs ──────────────────────────────────────────────────────────────
    ("locs_001",   "Starter Locs",                     "Begin your loc journey — two-strand, interloc, or comb coils",               120, 100, 180,  "Locs"),
    ("locs_002",   "Retwist / Interloc / Styles",      "Professional retwist, interlocking, or styled loc maintenance",              120,  80, 160,  "Locs"),
    ("locs_003",   "Loc Maintenance",                  "General loc upkeep including cleansing, conditioning, and re-palmrolling",   120,  65, 130,  "Locs"),

    # ── Natural Hair Styles ───────────────────────────────────────────────
    ("nat_001",    "Silk Press",                       "Relaxer-free silk press for smooth, sleek, heat-styled natural hair",        180,  75, 130,  "Natural Hair Styles"),
    ("nat_002",    "Two Strands Twist",                "Two-strand twists on natural hair with or without extensions",               120,  80, 140,  "Natural Hair Styles"),
    ("nat_003",    "Flat Twist",                       "Flat twists styled close to the scalp for a sleek natural look",             90,  65, 110,  "Natural Hair Styles"),
    ("nat_004",    "Wash and Go",                      "Cleanse, condition, and define natural curl pattern — no heat",              120,  60, 100,  "Natural Hair Styles"),
    ("nat_005",    "Wash and Set",                     "Shampoo, condition, and roller or wrap set for a smooth finish",             120,  65, 110,  "Natural Hair Styles"),

    # ── Bridal ────────────────────────────────────────────────────────────
    ("bridal_001", "Bridal Trial",                     "Pre-wedding style rehearsal to perfect your wedding day look",                90, 100, 200,  "Bridal"),
    ("bridal_002", "Wedding Day Style",                "Full bridal styling service on your wedding day",                            120, 150, 300,  "Bridal"),

    # ── Add On ────────────────────────────────────────────────────────────
    ("addon_001",  "Shampoo / Hydrate and Trim",       "Cleansing shampoo, deep hydration, and light trim add-on",                  120,  30,  55,  "Add On"),
    ("addon_002",  "Scalp Stimulator",                 "Invigorating scalp massage and stimulating serum application",               30,  25,  45,  "Add On"),
]

columns = ["id", "name", "description", "duration", "price_min", "price_max", "category"]
df = pd.DataFrame(services, columns=columns)

# Cloudinary public IDs — format: MyySignatureMyyStyle/{filename}
FOLDER = "MyySignatureMyyStyle"
cloudinary_ids = {
    "cut_001":    [f"{FOLDER}/hair_cut_hair_trim_1_e6zogm"],
    "cut_002":    [f"{FOLDER}/hair_cut_bang_edge_trim_1_fiwdf3"],
    "cut_003":    [f"{FOLDER}/hair_cut_haircut_1_ln8pb"],
    "chem_001":   [f"{FOLDER}/chemical_service_relaxer_texturizer_1_2tcwng"],
    "chem_002":   [f"{FOLDER}/chemical_service_perm_1_mt9v"],
    "chem_003":   [f"{FOLDER}/chemical_service_grey_coverage_1_cohtb6"],
    "chem_004":   [f"{FOLDER}/chemical_service_root_touchup_1_xsarcs"],
    "chem_005":   [f"{FOLDER}/chemical_service_single_process_color_1_evfe0a"],
    "chem_006":   [f"{FOLDER}/chemical_service_double_process_color_1_ajdn0o"],
    "chem_007":   [f"{FOLDER}/chemical_service_partial_full_highlight_1_3eo66p"],
    "treat_001":  [f"{FOLDER}/hair_treatment_deep_conditioning_treatment_1_atanzx"],
    "treat_002":  [f"{FOLDER}/hair_treatment_protein_treatment_1_gtc6s2"],
    "treat_003":  [f"{FOLDER}/hair_treatment_oil_treatment_1_gnvaef"],
    "treat_004":  [f"{FOLDER}/hair_treatment_scalp_treatment_1_dkwosx"],
    "treat_005":  [f"{FOLDER}/hair_treatment_olaplex_bond_repair_treatment_1_x3zl81"],
    "treat_006":  [f"{FOLDER}/hair_treatment_dr_c_tuna_hair_treatment_1_g8gfn5"],
    "ext_001":    [f"{FOLDER}/extensions_sew_in_1_jkde9i"],
    "ext_002":    [f"{FOLDER}/extensions_microlinks_1_6wc3mw"],
    "ext_003":    [f"{FOLDER}/extensions_tape_in_1_xey1u0"],
    "ext_004":    [f"{FOLDER}/extensions_wig_installation_1_z0ffgs"],
    "ext_005":    [f"{FOLDER}/extensions_up_do_1_ydegl1"],
    "ext_006":    [f"{FOLDER}/extensions_pixie_natural_hair_sew_in_1_xlfou1"],
    "ext_007":    [f"{FOLDER}/extensions_weave_maintenance_1_g8ioxi"],
    "ext_008":    [f"{FOLDER}/extensions_weave_take_down_1_tqis1c"],
    "braid_001":  [f"{FOLDER}/braids_feeding_fulani_lemonade_braids_1_px28gr"],
    "braid_002":  [f"{FOLDER}/braids_senegalese_twist_1_cpe6w3"],
    "braid_003":  [f"{FOLDER}/braids_crochet_1_xbtgtb"],
    "braid_004":  [f"{FOLDER}/braids_braids_maintenance_1_jp93t"],
    "braid_005":  [f"{FOLDER}/braids_braids_take_down_1_sti43qz"],
    "locs_001":   [f"{FOLDER}/locs_starter_locs_1_xkle1gs"],
    "locs_002":   [f"{FOLDER}/locs_retwist_interloc_styles_1_dby69v"],
    "locs_003":   [f"{FOLDER}/locs_loc_maintenance_1_eqzlwq"],
    "nat_001":    [f"{FOLDER}/natural_hair_styles_silk_press_1_ym0dka"],
    "nat_002":    [f"{FOLDER}/natural_hair_styles_two_strands_twist_1_xicpp"],
    "nat_003":    [f"{FOLDER}/natural_hair_styles_flat_twist_1_qllcirg"],
    "nat_004":    [f"{FOLDER}/natural_hair_styles_wash_and_go_1_jei8k0m"],
    "nat_005":    [f"{FOLDER}/natural_hair_styles_wash_and_set_1_zc0j2k"],
    "bridal_001": [f"{FOLDER}/bridal_bridal_trial_1_jsd1no"],
    "bridal_002": [f"{FOLDER}/bridal_wedding_day_style_1_ujnueg"],
    "addon_001":  [f"{FOLDER}/add_on_shampoo_hydrate_and_trim_1_f1une7"],
    "addon_002":  [f"{FOLDER}/add_on_scalp_stimulator_1_evctv0"],
}
df["images"] = df["id"].map(lambda sid: cloudinary_ids.get(sid, []))

# Sort by category order defined in the images, then by id within each category
category_order = [
    "Hair Cut",
    "Chemical Service",
    "Hair Treatment",
    "Extensions",
    "Braids",
    "Locs",
    "Natural Hair Styles",
    "Bridal",
    "Add On",
]
df["category"] = pd.Categorical(df["category"], categories=category_order, ordered=True)
df = df.sort_values(["category", "id"]).reset_index(drop=True)

records = df.to_dict(orient="records")

output_path = os.path.join(os.path.dirname(__file__), "..", "data", "services.json")
output_path = os.path.normpath(output_path)

with open(output_path, "w") as f:
    json.dump(records, f, indent=2)

# Summary
print(f"✅ Written {len(records)} services to {output_path}\n")
summary = df.groupby("category", observed=True).size().reset_index(name="count")
print(summary.to_string(index=False))
