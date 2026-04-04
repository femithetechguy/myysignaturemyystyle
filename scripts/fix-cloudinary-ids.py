"""
fix-cloudinary-ids.py
Updates data/services.json with the correct Cloudinary public IDs
fetched from the Cloudinary API.
Run: python3 scripts/fix-cloudinary-ids.py
"""
import json, os

CORRECT = {
    'cut_001':    'hair_cut_hair_trim_1_e6zogm',
    'cut_002':    'hair_cut_bang_edge_trim_1_fiwdf3',
    'cut_003':    'hair_cut_adult_haircut_1_dm498g',
    'cut_004':    'hair_cut_kids_haircut_1_lemrhk',
    'cut_005':    'hair_cut_military_haircut_1_kax3ty',
    'cut_006':    'hair_cut_fade_1_kn74at',
    'chem_001':   'chemical_service_relaxer_texturizer_1_ztcwng',
    'chem_002':   'chemical_service_perm_1_rnlr9v',
    'chem_003':   'chemical_service_grey_coverage_1_cohkb6',
    'chem_004':   'chemical_service_root_touchup_1_xsarcu',
    'chem_005':   'chemical_service_single_process_color_1_evfe0a',
    'chem_006':   'chemical_service_double_process_color_1_ajdrdo',
    'chem_007':   'chemical_service_partial_full_highlight_1_ecr66p',
    'treat_001':  'hair_treatment_deep_conditioning_treatment_1_atanzx',
    'treat_002':  'hair_treatment_protein_treatment_1_gdc8d2',
    'treat_003':  'hair_treatment_oil_treatment_1_gnraef',
    'treat_004':  'hair_treatment_scalp_treatment_1_dcwosx',
    'treat_005':  'hair_treatment_olaplex_bond_repair_treatment_1_x3zi81',
    'treat_006':  'hair_treatment_dr_c_tuna_hair_treatment_1_g9g6n5',
    'ext_001':    'extensions_sew_in_1_ykde9i',
    'ext_002':    'extensions_microlinks_1_dwz3mw',
    'ext_003':    'extensions_tape_in_1_xey1u0',
    'ext_004':    'extensions_wig_installation_1_odifga',
    'ext_005':    'extensions_up_do_1_ydegfi',
    'ext_006':    'extensions_pixie_natural_hair_sew_in_1_kifoul',
    'ext_007':    'extensions_weave_maintenance_1_gl8ooj',
    'ext_008':    'extensions_weave_take_down_1_lqlx1c',
    'braid_001':  'braids_feeding_fulani_lemonade_braids_1_pv28jy',
    'braid_002':  'braids_senegalese_twist_1_cpe6w3',
    'braid_003':  'braids_crochet_1_xblgtb',
    'braid_004':  'braids_braids_maintenance_1_jpt93t',
    'braid_005':  'braids_braids_take_down_1_sfd3qz',
    'locs_001':   'locs_starter_locs_1_kke1gs',
    'locs_002':   'locs_retwist_interloc_styles_1_dbyb9v',
    'locs_003':   'locs_loc_maintenance_1_eqzlwq',
    'nat_001':    'natural_hair_styles_silk_press_1_ym0dka',
    'nat_002':    'natural_hair_styles_two_strands_twist_1_wiqcpp',
    'nat_003':    'natural_hair_styles_flat_twist_1_oj0cxg',
    'nat_004':    'natural_hair_styles_wash_and_go_1_jw8k0m',
    'nat_005':    'natural_hair_styles_wash_and_set_1_zc0jzk',
    'bridal_001': 'bridal_bridal_trial_1_jsdnlo',
    'bridal_002': 'bridal_wedding_day_style_1_uyueqg',
    'addon_001':  'add_on_shampoo_hydrate_and_trim_1_f1une7',
    'addon_002':  'add_on_scalp_stimulator_1_evcbvb',
}

svc_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'services.json')

with open(svc_path) as f:
    services = json.load(f)

updated = 0
for svc in services:
    new_id = CORRECT.get(svc['id'])
    old_id = svc['images'][0] if svc['images'] else ''
    if new_id and new_id != old_id:
        print(f'  {svc["id"]:12} {old_id}  ->  {new_id}')
        svc['images'] = [new_id]
        updated += 1
    elif new_id:
        print(f'  {svc["id"]:12} OK  {new_id}')

with open(svc_path, 'w') as f:
    json.dump(services, f, indent=2)

print(f'\n✅ Done — updated {updated} IDs in data/services.json')
