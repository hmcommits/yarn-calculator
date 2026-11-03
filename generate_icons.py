import math
from PIL import Image, ImageDraw, ImageFont

def create_yarn_icon(size):
    # High resolution canvas for super-sampling (antialiasing)
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = canvas_size * 0.08
    r = canvas_size * 0.22  # corner radius for squircle

    # Background gradient: deep midnight navy to rich indigo
    # Create background rounded rectangle mask
    bg = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    bg_draw.rounded_rectangle([pad, pad, canvas_size - pad, canvas_size - pad], radius=r, fill=(15, 23, 42, 255))
    
    # Gradient overlay
    for y in range(int(pad), int(canvas_size - pad)):
        t = (y - pad) / (canvas_size - 2 * pad)
        # Gradient from #0f172a (15, 23, 42) to #1e1b4b (30, 27, 75) with teal accent glow
        r_c = int(15 * (1 - t) + 26 * t)
        g_c = int(23 * (1 - t) + 36 * t + 10 * math.sin(t * math.pi))
        b_c = int(42 * (1 - t) + 85 * t + 25 * math.sin(t * math.pi))
        bg_draw.line([(pad, y), (canvas_size - pad, y)], fill=(r_c, g_c, b_c, 255))

    # Apply rounded mask
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([pad, pad, canvas_size - pad, canvas_size - pad], radius=r, fill=255)
    img.paste(bg, (0, 0), mask)

    # Glowing subtle border
    draw.rounded_rectangle([pad, pad, canvas_size - pad, canvas_size - pad], radius=r, outline=(56, 189, 248, 120), width=int(3 * scale))

    # Center spool / bobbin coordinates
    cx = canvas_size / 2
    cy = canvas_size / 2

    # Draw yarn spool cone/bobbin
    spool_w = canvas_size * 0.44
    spool_h = canvas_size * 0.46
    top_w = spool_w * 0.65
    bot_w = spool_w

    top_y = cy - spool_h * 0.48
    bot_y = cy + spool_h * 0.48

    # Thread windings (layers of rounded curves representing precision yarn)
    # Vibrant emerald / cyan / violet gradient yarn coils
    num_threads = 9
    thread_step = (bot_y - top_y) / (num_threads + 1)
    
    for i in range(num_threads):
        ty = top_y + (i + 1) * thread_step
        t_prog = i / (num_threads - 1)
        w_cur = top_w + (bot_w - top_w) * t_prog
        x1 = cx - w_cur / 2
        x2 = cx + w_cur / 2
        
        # Color transition from Emerald (#10b981) to Electric Teal (#06b6d4) to Violet (#818cf8)
        if t_prog < 0.5:
            p = t_prog * 2
            cr = int(16 * (1 - p) + 6 * p)
            cg = int(185 * (1 - p) + 182 * p)
            cb = int(129 * (1 - p) + 212 * p)
        else:
            p = (t_prog - 0.5) * 2
            cr = int(6 * (1 - p) + 129 * p)
            cg = int(182 * (1 - p) + 140 * p)
            cb = int(212 * (1 - p) + 248 * p)

        th_h = thread_step * 0.76
        # Draw coiled thread cylinder section
        draw.rounded_rectangle([x1, ty - th_h/2, x2, ty + th_h/2], radius=int(th_h/2), fill=(cr, cg, cb, 240))
        # Highlight shine on coil
        draw.line([(cx - w_cur * 0.15, ty - th_h * 0.2), (cx + w_cur * 0.15, ty - th_h * 0.2)], fill=(255, 255, 255, 140), width=int(2 * scale))

    # Spool Flanges (Top and Bottom Bobbin caps)
    cap_h = canvas_size * 0.038
    # Top Cap
    draw.rounded_rectangle([cx - top_w * 0.58, top_y - cap_h, cx + top_w * 0.58, top_y + cap_h * 0.3], radius=int(cap_h * 0.5), fill=(226, 232, 240, 240))
    # Bottom Base
    draw.rounded_rectangle([cx - bot_w * 0.62, bot_y - cap_h * 0.3, cx + bot_w * 0.62, bot_y + cap_h], radius=int(cap_h * 0.5), fill=(226, 232, 240, 240))

    # Flowing Yarn Thread strand winding out to the right
    strand_points = []
    start_x = cx + bot_w * 0.48
    start_y = bot_y - thread_step * 1.5
    for s in range(35):
        st = s / 34.0
        # Bezier-like wave path moving upward right
        sx = start_x + st * (canvas_size * 0.26)
        sy = start_y - math.sin(st * math.pi * 1.2) * (canvas_size * 0.28) + st * 10
        strand_points.append((sx, sy))

    for k in range(len(strand_points) - 1):
        draw.line([strand_points[k], strand_points[k+1]], fill=(56, 189, 248, 240), width=int(4 * scale))
        
    # Caliper / meter scale markings at left to signify scientific count & measurement (Tex, eng, Den, Nm)
    meas_x = canvas_size * 0.18
    meas_y1 = top_y + 10
    meas_y2 = bot_y - 10
    draw.line([(meas_x, meas_y1), (meas_x, meas_y2)], fill=(148, 163, 184, 180), width=int(2 * scale))
    for m in range(7):
        my = meas_y1 + (meas_y2 - meas_y1) * (m / 6.0)
        tick_w = canvas_size * (0.03 if m % 2 == 0 else 0.018)
        draw.line([(meas_x, my), (meas_x + tick_w, my)], fill=(148, 163, 184, 220), width=int(2 * scale))

    # Downsample with high quality Lanczos filter for razor-sharp antialiasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Generate icons
for s in [512, 192, 180, 64, 32]:
    icon = create_yarn_icon(s)
    if s == 512:
        icon.save("icons/icon-512.png")
    elif s == 192:
        icon.save("icons/icon-192.png")
    elif s == 180:
        icon.save("icons/apple-touch-icon.png")
    elif s == 32:
        icon.save("icons/favicon-32.png")

print("Generated PNG icons successfully!")
