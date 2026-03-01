---

# 🎨 Chrome 확장 아이콘 생성 가이드

## 1️⃣ 방법 A: generate_icons.py (Python 스크립트 - 권장)

이 스크립트를 실행하면 자동으로 아이콘을 생성합니다.

### **generate_icons.py**

```python
#!/usr/bin/env python3
"""
Auto Bing Search 확장용 아이콘 생성 스크립트
SVG를 PNG로 변환합니다.

사용법: python3 generate_icons.py
"""

import os
import subprocess
from pathlib import Path

def create_svg_icon():
    """SVG 아이콘 생성"""
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <rect width="128" height="128" fill="#0078d4" rx="24"/>

  <!-- 돋보기 아이콘 -->
  <g transform="translate(32, 24)">
    <!-- 돋보기 원 -->
    ircle cx="24" cy="24" r="20" fill="none" stroke="white" stroke-width="3"/>

    <!-- 돋보기 손잡이 -->
    e x1="40" y1="40" x2="56" y2="56" stroke="white" stroke-width="3" stroke-linecap="round"/>

    <!-- 검색 기호 (+ 모양) -->
    e x1="24" y1="18" x2="24" y2="30" stroke="white" stroke-width="2" stroke-linecap="round"/>
    e x1="18" y1="24" x2="30" y2="24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- 텍스트 (선택사항) -->
  <text x="64" y="110" font-size="12" fill="white" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">
    SEARCH
  </text>
</svg>'''

    return svg_content

def create_svg_icon_simple():
    """간단한 SVG 아이콘 (더 나은 버전)"""
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    earGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0078d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1084d8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="128" height="128" fill="url(#grad)" rx="20"/>

  <!-- 외부 테두리 -->
  <rect width="128" height="128" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="20"/>

  <!-- 돋보기 아이콘 (중앙) -->
  <g transform="translate(16, 16)">
    <!-- 원 (렌즈) -->
    ircle cx="32" cy="32" r="26" fill="none" stroke="white" stroke-width="4"/>

    <!-- 손잡이 -->
    e x1="52" y1="52" x2="76" y2="76" stroke="white" stroke-width="4" stroke-linecap="round"/>

    <!-- 중앙 십자 -->
    e x1="32" y1="20" x2="32" y2="44" stroke="white" stroke-width="3" stroke-linecap="round"/>
    e x1="20" y1="32" x2="44" y2="32" stroke="white" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>'''

    return svg_content

def create_icon_from_svg(svg_content, output_path, size):
    """SVG를 PNG로 변환"""
    # 임시 SVG 파일 생성
    temp_svg = "temp_icon.svg"

    with open(temp_svg, 'w', encoding='utf-8') as f:
        f.write(svg_content)

    # ImageMagick 또는 inkscape를 사용하여 변환
    try:
        # ImageMagick convert 사용 (가장 일반적)
        subprocess.run([
            'convert',
            '-background', 'none',
            '-size', f'{size}x{size}',
            temp_svg,
            '-resize', f'{size}x{size}',
            output_path
        ], check=True)

        print(f"✅ {output_path} 생성됨 ({size}x{size})")

    except FileNotFoundError:
        try:
            # Inkscape 사용
            subprocess.run([
                'inkscape',
                '--export-type=png',
                f'--export-width={size}',
                f'--export-height={size}',
                '-o', output_path,
                temp_svg
            ], check=True)

            print(f"✅ {output_path} 생성됨 ({size}x{size})")

        except FileNotFoundError:
            print("❌ ImageMagick이나 Inkscape가 설치되어 있지 않습니다.")
            print("\n설치 방법:")
            print("  macOS: brew install imagemagick")
            print("  Linux: sudo apt-get install imagemagick")
            print("  Windows: choco install imagemagick")
            return False

    finally:
        # 임시 파일 제거
        if os.path.exists(temp_svg):
            os.remove(temp_svg)

    return True

def create_icons_with_pillow(svg_content):
    """PIL/Pillow를 사용한 방법 (SVG 지원 제한)"""
    try:
        from PIL import Image, ImageDraw

        # 흰색 배경에 파란색 원과 흰색 돋보기 그리기
        sizes = [16, 48, 128]

        for size in sizes:
            # 새 이미지 생성 (파란 배경)
            img = Image.new('RGB', (size, size), color=(0, 120, 212))
            draw = ImageDraw.Draw(img)

            # 돋보기 그리기 (원)
            margin = size // 8
            circle_bbox = [
                margin,
                margin,
                size - margin,
                size - margin
            ]
            draw.ellipse(circle_bbox, outline='white', width=max(1, size // 32))

            # 손잡이 그리기 (선)
            handle_start = size - margin - size // 16
            handle_end = size - margin // 4
            draw.line(
                [(handle_start, handle_start), (handle_end, handle_end)],
                fill='white',
                width=max(1, size // 16)
            )

            # 저장
            output_path = f"images/icon-{size}.png"
            img.save(output_path, 'PNG')
            print(f"✅ {output_path} 생성됨 ({size}x{size})")

def main():
    """메인 함수"""
    print("🎨 Auto Bing Search 아이콘 생성 중...\n")

    # images 폴더 생성
    os.makedirs('images', exist_ok=True)
    print("📁 images 폴더 확인\n")

    # SVG 콘텐츠 생성
    svg_content = create_svg_icon_simple()

    # 각 크기별 아이콘 생성
    sizes = [16, 48, 128]

    print("1️⃣ ImageMagick/Inkscape를 사용하여 생성 시도...\n")
    success = False

    for size in sizes:
        output_path = f"images/icon-{size}.png"
        if create_icon_from_svg(svg_content, output_path, size):
            success = True

    # ImageMagick이 없으면 Pillow 사용
    if not success:
        print("\n2️⃣ Pillow를 사용하여 생성...\n")
        try:
            create_icons_with_pillow(svg_content)
        except ImportError:
            print("❌ Pillow가 설치되어 있지 않습니다.")
            print("설치: pip install Pillow")
            return False

    print("\n✅ 모든 아이콘 생성 완료!")
    print("\n생성된 파일:")
    print("  - images/icon-16.png (16x16)")
    print("  - images/icon-48.png (48x48)")
    print("  - images/icon-128.png (128x128)")

    return True

if __name__ == "__main__":
    main()
```

---

## 2️⃣ 실행 방법

### **Step 1: Python 설치 확인**

```bash
python3 --version
# 또는
python --version
```

### **Step 2: 필요한 라이브러리 설치**

**옵션 A: ImageMagick 사용 (권장)**

```bash
# macOS
brew install imagemagick

# Linux (Ubuntu/Debian)
sudo apt-get install imagemagick

# Windows (Chocolatey 필요)
choco install imagemagick
```

**옵션 B: Pillow 사용 (더 간단)**

```bash
pip install Pillow
```

### **Step 3: 스크립트 실행**

```bash
cd auto-bing-search-extension
python3 generate_icons.py
```

**결과:**

```
🎨 Auto Bing Search 아이콘 생성 중...

📁 images 폴더 확인

1️⃣ ImageMagick/Inkscape를 사용하여 생성 시도...

✅ images/icon-16.png 생성됨 (16x16)
✅ images/icon-48.png 생성됨 (48x48)
✅ images/icon-128.png 생성됨 (128x128)

✅ 모든 아이콘 생성 완료!
```

---

## 3️⃣ 온라인 도구를 사용한 방법

만약 Python이 없다면 온라인 도구를 사용할 수 있습니다:

### **SVG 아이콘 코드 (icon.svg)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    earGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0078d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1084d8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="128" height="128" fill="url(#grad)" rx="20"/>
  <rect width="128" height="128" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="20"/>

  <!-- 돋보기 아이콘 -->
  <g transform="translate(16, 16)">
    <!-- 렌즈 (원) -->
    ircle cx="32" cy="32" r="26" fill="none" stroke="white" stroke-width="4"/>

    <!-- 손잡이 (선) -->
    e x1="52" y1="52" x2="76" y2="76" stroke="white" stroke-width="4" stroke-linecap="round"/>

    <!-- 중앙 십자 -->
    e x1="32" y1="20" x2="32" y2="44" stroke="white" stroke-width="3" stroke-linecap="round"/>
    e x1="20" y1="32" x2="44" y2="32" stroke="white" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
```

### **온라인 변환 도구**

1. **CloudConvert** (https://cloudconvert.com/svg-to-png)
   - SVG 파일 업로드
   - 출력 형식: PNG
   - 크기: 128x128 선택
   - 다운로드

2. **Convertio** (https://convertio.co/svg-png/)
   - SVG 파일 업로드
   - PNG로 변환
   - 다운로드

3. **Zamzar** (https://www.zamzar.com/convert/svg-to-png/)
   - SVG 업로드
   - PNG로 변환
   - 이메일로 전송

---

## 4️⃣ Bash 스크립트 (자동 생성)

```bash
#!/bin/bash
# create_icons.sh

echo "🎨 아이콘 생성 중..."

# images 폴더 생성
mkdir -p images

# SVG 파일 생성
cat > temp_icon.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    earGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0078d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1084d8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <rect width="128" height="128" fill="url(#grad)" rx="20"/>
  <rect width="128" height="128" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="20"/>

  <g transform="translate(16, 16)">
    ircle cx="32" cy="32" r="26" fill="none" stroke="white" stroke-width="4"/>
    e x1="52" y1="52" x2="76" y2="76" stroke="white" stroke-width="4" stroke-linecap="round"/>
    e x1="32" y1="20" x2="32" y2="44" stroke="white" stroke-width="3" stroke-linecap="round"/>
    e x1="20" y1="32" x2="44" y2="32" stroke="white" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
EOF

# ImageMagick 사용
```
