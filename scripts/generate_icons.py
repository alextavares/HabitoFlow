#!/usr/bin/env python3
"""
Script para gerar ícones do app em todos os tamanhos necessários para Android
Requer: pip install pillow
"""

import os
import platform
from PIL import Image, ImageDraw, ImageFont
import math

def create_app_icon(size):
    """Cria um ícone do HabitoFlow no tamanho especificado"""
    # Criar imagem com fundo gradiente
    img = Image.new('RGB', (size, size), color='#6366F1')
    draw = ImageDraw.Draw(img)
    
    # Adicionar gradiente radial
    center_x, center_y = size // 2, size // 2
    max_radius = size // 2
    
    for y in range(size):
        for x in range(size):
            # Calcular distância do centro
            distance = math.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)
            if distance <= max_radius:
                # Interpolação de cor para gradiente
                ratio = distance / max_radius
                r1, g1, b1 = 99, 102, 241  # #6366F1
                r2, g2, b2 = 129, 140, 248  # #818CF8
                
                r = int(r1 + (r2 - r1) * ratio)
                g = int(g1 + (g2 - g1) * ratio)
                b = int(b1 + (b2 - b1) * ratio)
                
                draw.point((x, y), (r, g, b))
    
    # Adicionar círculo branco central
    circle_size = int(size * 0.7)
    circle_pos = (size - circle_size) // 2
    draw.ellipse(
        [circle_pos, circle_pos, circle_pos + circle_size, circle_pos + circle_size],
        fill='white'
    )
    
    # Adicionar símbolo de check/hábito
    check_size = int(size * 0.4)
    check_thickness = max(2, int(size * 0.08))
    check_color = '#6366F1'
    
    # Coordenadas do check mark
    start_x = int(size * 0.35)
    start_y = int(size * 0.5)
    mid_x = int(size * 0.45)
    mid_y = int(size * 0.6)
    end_x = int(size * 0.65)
    end_y = int(size * 0.4)
    
    # Desenhar check mark
    draw.line([(start_x, start_y), (mid_x, mid_y)], fill=check_color, width=check_thickness)
    draw.line([(mid_x, mid_y), (end_x, end_y)], fill=check_color, width=check_thickness)
    
    return img

def generate_android_icons():
    """Gera todos os ícones necessários para Android"""
    
    # Definir tamanhos e pastas para Android
    android_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    
    # Detectar o caminho correto baseado no sistema operacional
    import platform
    if platform.system() == 'Windows':
        base_path = r'C:\codigos\pesquisarpp\HabitoFlow\android\app\src\main\res'
    else:
        base_path = '/mnt/c/codigos/pesquisarpp/HabitoFlow/android/app/src/main/res'
    
    # Criar ícone adaptativo (foreground + background)
    for folder, size in android_sizes.items():
        folder_path = os.path.join(base_path, folder)
        
        # Ícone principal
        icon = create_app_icon(size)
        icon.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')
        
        # Ícone round (mesmo design)
        icon.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')
        
        print(f"✓ Gerado ícone {size}x{size} em {folder}")
    
    # Gerar ícone para Play Store (512x512)
    playstore_icon = create_app_icon(512)
    if platform.system() == 'Windows':
        playstore_path = r'C:\codigos\pesquisarpp\HabitoFlow\android\app\src\main\playstore-icon.png'
    else:
        playstore_path = '/mnt/c/codigos/pesquisarpp/HabitoFlow/android/app/src/main/playstore-icon.png'
    playstore_icon.save(playstore_path, 'PNG')
    print(f"✓ Gerado ícone da Play Store 512x512")
    
    # Criar ícone adaptativo foreground (com padding)
    for folder, size in android_sizes.items():
        # Ícone adaptativo precisa de 108dp (1.5x do tamanho)
        adaptive_size = int(size * 1.5)
        
        # Criar imagem transparente maior
        img = Image.new('RGBA', (adaptive_size, adaptive_size), (0, 0, 0, 0))
        
        # Criar ícone menor e centralizar
        icon_size = int(size * 0.9)
        icon = create_app_icon(icon_size)
        
        # Converter para RGBA
        icon_rgba = Image.new('RGBA', icon.size)
        icon_rgba.paste(icon)
        
        # Posicionar no centro
        position = (adaptive_size - icon_size) // 2
        img.paste(icon_rgba, (position, position))
        
        # Salvar em mipmap-anydpi-v26 se necessário
        folder_path = os.path.join(base_path, folder)
        img.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), 'PNG')
        
    print("✓ Gerados ícones adaptativos foreground")

def create_notification_icon():
    """Cria ícone de notificação (monocromático)"""
    sizes = {
        'drawable-mdpi': 24,
        'drawable-hdpi': 36,
        'drawable-xhdpi': 48,
        'drawable-xxhdpi': 72,
        'drawable-xxxhdpi': 96,
    }
    
    # Detectar o caminho correto baseado no sistema operacional
    import platform
    if platform.system() == 'Windows':
        base_path = r'C:\codigos\pesquisarpp\HabitoFlow\android\app\src\main\res'
    else:
        base_path = '/mnt/c/codigos/pesquisarpp/HabitoFlow/android/app/src/main/res'
    
    for folder, size in sizes.items():
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # Criar ícone monocromático
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Desenhar check mark simples
        check_thickness = max(1, int(size * 0.1))
        
        start_x = int(size * 0.2)
        start_y = int(size * 0.5)
        mid_x = int(size * 0.4)
        mid_y = int(size * 0.7)
        end_x = int(size * 0.8)
        end_y = int(size * 0.3)
        
        # Usar branco com alpha para compatibilidade
        draw.line([(start_x, start_y), (mid_x, mid_y)], fill=(255, 255, 255, 255), width=check_thickness)
        draw.line([(mid_x, mid_y), (end_x, end_y)], fill=(255, 255, 255, 255), width=check_thickness)
        
        img.save(os.path.join(folder_path, 'ic_notification.png'), 'PNG')
        
    print("✓ Gerados ícones de notificação")

if __name__ == "__main__":
    print("🎨 Gerando ícones do HabitoFlow...")
    print("-" * 40)
    
    try:
        generate_android_icons()
        create_notification_icon()
        print("-" * 40)
        print("✅ Todos os ícones foram gerados com sucesso!")
    except ImportError:
        print("❌ Erro: Pillow não está instalado.")
        print("   Execute: pip install pillow")
    except Exception as e:
        print(f"❌ Erro ao gerar ícones: {e}")