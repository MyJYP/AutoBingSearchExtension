#!/bin/bash

################################################################################
# Auto Bing Search 확장 - 아이콘 생성 스크립트
# 
# 용도: 16x16, 48x48, 128x128 PNG 아이콘 자동 생성
# 
# 사용법:
#   chmod +x create_icons.sh
#   ./create_icons.sh
#
# 요구사항:
#   - ImageMagick (convert 명령어)
#   - 또는 Pillow (Python)
################################################################################

set -e  # 오류 발생 시 스크립트 중단

# ─────────────────────────────────────────────────────────────────────────────
# 색상 정의
# ─────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 색상 초기화

# ─────────────────────────────────────────────────────────────────────────────
# 함수 정의
# ─────────────────────────────────────────────────────────────────────────────

# 로그 출력 함수
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 의존성 확인
check_dependencies() {
    log_info "의존성 확인 중..."
    
    # ImageMagick 확인
    if command -v convert &> /dev/null; then
        log_success "ImageMagick 찾음"
        return 0
    fi
    
    # Inkscape 확인
    if command -v inkscape &> /dev/null; then
        log_success "Inkscape 찾음"
        return 0
    fi
    
    # Python/Pillow 확인
    if command -v python3 &> /dev/null; then
        if python3 -c "import PIL" 2>/dev/null; then
            log_success "Python/Pillow 찾음"
            return 0
        fi
    fi
    
    log_error "필요한 도구를 찾을 수 없습니다"
    return 1
}

# 설치 안내
show_installation_help() {
    log_warning "필요한 도구를 설치해주세요:\n"
    
    echo "macOS (Homebrew):"
    echo "  brew install imagemagick"
    echo ""
    echo "Linux (Ubuntu/Debian):"
    echo "  sudo apt-get install imagemagick"
    echo ""
    echo "Windows (Chocolatey):"
    echo "  choco install imagemagick"
    echo ""
    echo "또는 Python/Pillow 설치:"
    echo "  pip install Pillow"
    echo ""
}

# SVG 파일 생성
create_svg_file() {
    local svg_file="$1"
    
    log_info "SVG 파일 생성 중: $svg_file"
    
    cat > "$svg_file" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    earGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0078d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1084d8;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- 배경 -->
  <rect width="128" height="128" fill="url(#grad)" rx="20" filter="url(#shadow)"/>
  
  <!-- 테두리 -->
  <rect width="128" height="128" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="20"/>
  
  <!-- 돋보기 아이콘 그룹 -->
  <g transform="translate(16, 16)">
    <!-- 렌즈 (원) -->
    ircle cx="32" cy="32" r="26" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>
    
    <!-- 손잡이 (선) -->
    e x1="52" y1="52" x2="76" y2="76" stroke="white" stroke-width="4" stroke-linecap="round"/>
    
    <!-- 중앙 십자 (검색 기호) -->
    e x1="32" y1="18" x2="32" y2="46" stroke="white" stroke-width="3" stroke-linecap="round"/>
    e x1="18" y1="32" x2="46" y2="32" stroke="white" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
EOF
    
    log_success "SVG 파일 생성 완료"
}

# ImageMagick을 사용한 변환
convert_with_imagemagick() {
    local svg_file="$1"
    local output_dir="$2"
    local sizes=(16 48 128)
    
    log_info "ImageMagick을 사용하여 PNG 변환 중..."
    
    for size in "${sizes[@]}"; do
        local output_file="$output_dir/icon-$size.png"
        
        echo -n "  생성 중: $output_file ... "
        
        # ImageMagick convert 명령어
        convert \
            -background none \
            -size "${size}x${size}" \
            "$svg_file" \
            -resize "${size}x${size}" \
            "$output_file"
        
        if [ -f "$output_file" ]; then
            echo "완료 ✓"
            log_success "생성됨: $output_file (${size}x${size})"
        else
            echo "실패 ✗"
            log_error "생성 실패: $output_file"
            return 1
        fi
    done
    
    return 0
}

# Inkscape를 사용한 변환
convert_with_inkscape() {
    local svg_file="$1"
    local output_dir="$2"
    local sizes=(16 48 128)
    
    log_info "Inkscape를 사용하여 PNG 변환 중..."
    
    for size in "${sizes[@]}"; do
        local output_file="$output_dir/icon-$size.png"
        
        echo -n "  생성 중: $output_file ... "
        
        # Inkscape 명령어
        inkscape \
            --export-type=png \
            --export-width="$size" \
            --export-height="$size" \
            -o "$output_file" \
            "$svg_file"
        
        if [ -f "$output_file" ]; then
            echo "완료 ✓"
            log_success "생성됨: $output_file (${size}x${size})"
        else
            echo "실패 ✗"
            log_error "생성 실패: $output_file"
            return 1
        fi
    done
    
    return 0
}

# Python/Pillow를 사용한 변환
convert_with_python() {
    local svg_file="$1"
    local output_dir="$2"
    
    log_info "Python/Pillow를 사용하여 PNG 생성 중..."
    
    python3 << PYTHON_SCRIPT
from PIL import Image, ImageDraw

sizes = [16, 48, 128]

for size in sizes:
    # 파란 배경 이미지 생성
    img = Image.new('RGB', (size, size), color=(0, 120, 212))
    draw = ImageDraw.Draw(img)
    
    # 스케일 계산
    margin = size // 8
    line_width = max(1, size // 16)
    
    # 돋보기 원 그리기
    circle_bbox = [margin, margin, size - margin, size - margin]
    draw.ellipse(circle_bbox, outline='white', width=line_width)
    
    # 손잡이 그리기
    handle_start = size - margin - size // 16
    handle_end = size - margin // 4
    draw.line(
        [(handle_start, handle_start), (handle_end, handle_end)],
        fill='white',
        width=line_width
    )
    
    # 중앙 십자 그리기
    center = size // 2
    cross_len = size // 6
    draw.line(
        [(center, center - cross_len), (center, center + cross_len)],
        fill='white',
        width=max(1, size // 32)
    )
    draw.line(
        [(center - cross_len, center), (center + cross_len, center)],
        fill='white',
        width=max(1, size // 32)
    )
    
    # 저장
    output_path = f"$output_dir/icon-{size}.png"
    img.save(output_path, 'PNG')
    print(f"✓ {output_path} 생성됨 ({size}x{size})")

print("\n✅ 모든 아이콘이 생성되었습니다!")
PYTHON_SCRIPT
    
    return $?
}

# 메인 함수
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║     🎨 Auto Bing Search 확장 - 아이콘 생성 스크립트           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # 현재 디렉토리 확인
    if [ ! -f "manifest.json" ]; then
        log_error "manifest.json을 찾을 수 없습니다"
        log_info "이 스크립트를 확장 프로젝트 루트 디렉토리에서 실행하세요"
        exit 1
    fi
    
    log_success "Auto Bing Search 확장 디렉토리 확인됨"
    
    # images 폴더 생성
    mkdir -p images
    log_success "images 폴더 생성/확인됨"
    
    # SVG 파일 생성
    SVG_FILE="temp_icon.svg"
    create_svg_file "$SVG_FILE"
    
    echo ""
    
    # 의존성 확인 및 변환
    if command -v convert &> /dev/null; then
        log_info "ImageMagick으로 변환 중..."
        convert_with_imagemagick "$SVG_FILE" "images"
        CONVERSION_SUCCESS=$?
        
    elif command -v inkscape &> /dev/null; then
        log_info "Inkscape로 변환 중..."
        convert_with_inkscape "$SVG_FILE" "images"
        CONVERSION_SUCCESS=$?
        
    elif command -v python3 &> /dev/null && python3 -c "import PIL" 2>/dev/null; then
        log_info "Python/Pillow로 변환 중..."
        convert_with_python "$SVG_FILE" "images"
        CONVERSION_SUCCESS=$?
        
    else
        log_error "변환 도구를 찾을 수 없습니다"
        show_installation_help
        
        # 임시 SVG 파일 정리
        rm -f "$SVG_FILE"
        exit 1
    fi
    
    # 임시 SVG 파일 정리
    rm -f "$SVG_FILE"
    
    echo ""
    
    # 결과 확인
    if [ $CONVERSION_SUCCESS -eq 0 ]; then
        echo "╔════════════════════════════════════════════════════════════════╗"
        echo "║                     ✅ 성공적으로 완료됨!                      ║"
        echo "╚════════════════════════════════════════════════════════════════╝"
        echo ""
        
        log_success "생성된 파일:"
        echo "  • images/icon-16.png   (16x16)"
        echo "  • images/icon-48.png   (48x48)"
        echo "  • images/icon-128.png  (128x128)"
        echo ""
        
        # 파일 크기 표시
        echo "파일 크기:"
        du -h images/icon-*.png 2>/dev/null | awk '{print "  • " $2 " (" $1 ")"}'
        echo ""
        
        log_success "확장 프로그램 설치 준비 완료!"
        echo ""
        echo "다음 단계:"
        echo "  1. chrome://extensions/ 접속"
        echo "  2. '개발자 모드' 활성화"
        echo "  3. '압축해제된 확장 프로그램을 로드합니다' 클릭"
        echo "  4. 현재 폴더 선택"
        echo ""
        
        return 0
    else
        log_error "아이콘 생성에 실패했습니다"
        echo ""
        show_installation_help
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 스크립트 실행
# ─────────────────────────────────────────────────────────────────────────────

main
exit $?
