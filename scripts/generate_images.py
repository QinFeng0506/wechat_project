"""
一次性生成所有占位图片 PNG
用法：python generate_images.py
"""
import struct, zlib, os

def create_png(path, r, g, b, size=200):
    """生成纯色方形PNG"""
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))

    raw = b''
    for y in range(size):
        raw += b'\x00'  # filter: none
        for x in range(size):
            raw += bytes([r, g, b])

    idat = chunk(b'IDAT', zlib.compress(raw))
    iend = chunk(b'IEND', b'')

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(header + ihdr + idat + iend)
    return True


BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)

print("=== 生成占位图片 ===")

# TabBar 图标（81x81）
print("\n[TabBar 图标]")
for name in ['home', 'gallery', 'booking', 'user']:
    create_png(f'{ROOT}/images/tabbar/{name}.png', 196, 181, 181, size=81)
    print(f'  {name}.png - 灰色(未选中)')
    create_png(f'{ROOT}/images/tabbar/{name}-active.png', 212, 160, 160, size=81)
    print(f'  {name}-active.png - 粉色(选中)')

# Banner
print("\n[Banner 轮播图]")
for i in range(1, 4):
    create_png(f'{ROOT}/images/banner/banner{i}.png', 245, 235, 235, size=400)
    print(f'  banner{i}.png')

# 美甲款式图
print("\n[美甲款式图]")
colors = [
    (245,235,235),(240,230,240),(235,235,245),(245,240,230),
    (240,245,235),(245,235,240),(235,240,245),(245,238,230)
]
for i, (r,g,b) in enumerate(colors):
    create_png(f'{ROOT}/images/nails/nail{i+1}.png', r, g, b)
    print(f'  nail{i+1}.png')

# 款式副图
for name in ['nail1_2', 'nail2_2', 'nail4_2', 'nail7_2']:
    create_png(f'{ROOT}/images/nails/{name}.png', 235, 230, 240)
    print(f'  {name}.png')

# 美睫 & 护理
for name, color in [('lash1',(235,230,225)),('lash2',(225,230,235)),
                     ('care1',(225,240,230)),('care2',(230,235,225))]:
    create_png(f'{ROOT}/images/nails/{name}.png', *color)
    print(f'  {name}.png')

# 技师头像
print("\n[技师头像]")
for i, (r,g,b) in enumerate([(255,220,200),(255,210,195),(255,225,210)]):
    create_png(f'{ROOT}/images/technicians/t{i+1}.png', r, g, b, size=200)
    print(f'  t{i+1}.png')

# 门店图
print("\n[门店图片]")
create_png(f'{ROOT}/images/store/logo.png', 212, 160, 160, size=200)
print('  logo.png')
create_png(f'{ROOT}/images/store/marker.png', 212, 60, 60, size=80)
print('  marker.png')
for i in range(1, 4):
    create_png(f'{ROOT}/images/store/store{i}.png', 240, 235, 230, size=400)
    print(f'  store{i}.png')

# 默认头像
create_png(f'{ROOT}/images/common/default-avatar.png', 237, 213, 213, size=200)
print('\n[通用]')
print('  default-avatar.png')

print(f"\n✅ 全部图片已生成到 {ROOT}/images/")
