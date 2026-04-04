"""
Fetches all image public_ids from Cloudinary and updates data/services.json
Run: python3 scripts/fetch-cloudinary-ids.py
"""
import urllib.request, base64, json, os, re, sys

# Load creds from .env.local
env = {}
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

key    = env.get('CLOUDINARY_API_KEY')
secret = env.get('CLOUDINARY_API_SECRET')
cloud  = env.get('CLOUDINARY_CLOUD_NAME')

creds = base64.b64encode(f'{key}:{secret}'.encode()).decode()

# Fetch all resources (paginate if needed)
all_ids = []
url = f'https://api.cloudinary.com/v1_1/{cloud}/resources/image?max_results=500'
while url:
    req = urllib.request.Request(url, headers={'Authorization': f'Basic {creds}'})
    data = json.loads(urllib.request.urlopen(req).read())
    all_ids += [r['public_id'] for r in data.get('resources', [])]
    next_cursor = data.get('next_cursor')
    url = f'https://api.cloudinary.com/v1_1/{cloud}/resources/image?max_results=500&next_cursor={next_cursor}' if next_cursor else None

print(f'Fetched {len(all_ids)} assets from Cloudinary:\n')
for pid in sorted(all_ids):
    print(' ', pid)

# Load services.json
svc_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'services.json')
with open(svc_path) as f:
    services = json.load(f)

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')

# Match each service to its Cloudinary asset by slug prefix
def find_id(service):
    prefix = slugify(service['category']) + '_' + slugify(service['name']) + '_1_'
    matches = [pid for pid in all_ids if pid.lower().startswith(prefix.lower())]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        print(f'  WARNING: multiple matches for {service["id"]}: {matches}', file=sys.stderr)
        return matches[0]
    print(f'  NO MATCH for {service["id"]} (prefix: {prefix})', file=sys.stderr)
    return service['images'][0] if service['images'] else ''

updated = 0
for svc in services:
    new_id = find_id(svc)
    old_id = svc['images'][0] if svc['images'] else ''
    if new_id and new_id != old_id:
        svc['images'] = [new_id]
        print(f'  Updated {svc["id"]}: {old_id} -> {new_id}')
        updated += 1

with open(svc_path, 'w') as f:
    json.dump(services, f, indent=2)

print(f'\n✅ Updated {updated} IDs in data/services.json')
