let selectedText = '';

// 获取DOM元素
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const bgStyleSelect = document.getElementById('bgStyle');
const gradientControls = document.getElementById('gradientControls');
const gradientDirectionSelect = document.getElementById('gradientDirection');
const bgColorInput = document.getElementById('bgColor');
const bgColor2Input = document.getElementById('bgColor2');
const textColorInput = document.getElementById('textColor');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontFamilySelect = document.getElementById('fontFamily');
const textAlignSelect = document.getElementById('textAlign');
const paddingInput = document.getElementById('padding');
const paddingValue = document.getElementById('paddingValue');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');

// 初始化画布大小
canvas.width = 800;
canvas.height = 400;

// 字体映射
const fontFamilyMap = {
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: '"Songti SC", "SimSun", serif',
  cursive: '"Kaiti SC", "KaiTi", cursive'
};

// 预设模板配置
const templates = {
  sunset: {
    bgStyle: 'gradient',
    gradientDirection: 'horizontal',
    bgColor: '#FF6B6B',
    bgColor2: '#4ECDC4',
    textColor: '#FFFFFF',
    fontSize: '24',
    fontFamily: 'default',
    textAlign: 'center',
    padding: '50'
  },
  ocean: {
    bgStyle: 'gradient',
    gradientDirection: 'horizontal',
    bgColor: '#2193b0',
    bgColor2: '#6dd5ed',
    textColor: '#FFFFFF',
    fontSize: '24',
    fontFamily: 'default',
    textAlign: 'center',
    padding: '50'
  },
  forest: {
    bgStyle: 'gradient',
    gradientDirection: 'horizontal',
    bgColor: '#11998e',
    bgColor2: '#38ef7d',
    textColor: '#FFFFFF',
    fontSize: '24',
    fontFamily: 'default',
    textAlign: 'center',
    padding: '50'
  },
  purple: {
    bgStyle: 'gradient',
    gradientDirection: 'horizontal',
    bgColor: '#834d9b',
    bgColor2: '#d04ed6',
    textColor: '#FFFFFF',
    fontSize: '24',
    fontFamily: 'default',
    textAlign: 'center',
    padding: '50'
  }
};

// 获取选中的文本
window.addEventListener('load', () => {
  chrome.storage.local.get(['selectedText'], (result) => {
    if (result.selectedText) {
      selectedText = result.selectedText;
      drawCanvas();
    }
  });
});

// 监听背景样式变化
bgStyleSelect.addEventListener('change', () => {
  const isGradient = bgStyleSelect.value === 'gradient';
  gradientControls.style.display = isGradient ? 'flex' : 'none';
  bgColor2Input.style.display = isGradient ? 'block' : 'none';
  drawCanvas();
});

// 更新数值显示
fontSizeInput.addEventListener('input', () => {
  fontSizeValue.textContent = `${fontSizeInput.value}px`;
  drawCanvas();
});

paddingInput.addEventListener('input', () => {
  paddingValue.textContent = `${paddingInput.value}px`;
  drawCanvas();
});

// 创建渐变背景
function createGradient() {
  let gradient;
  switch (gradientDirectionSelect.value) {
    case 'diagonal':
      gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      break;
    case 'vertical':
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      break;
    case 'horizontal':
      gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      break;
  }
  gradient.addColorStop(0, bgColorInput.value);
  gradient.addColorStop(1, bgColor2Input.value);
  return gradient;
}

// 智能分行（支持中文）
function getLines(text, maxWidth) {
  const chars = text.split('');
  const lines = [];
  let currentLine = '';

  for (let char of chars) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// 绘制画布
function drawCanvas() {
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 设置背景
  if (bgStyleSelect.value === 'gradient') {
    ctx.fillStyle = createGradient();
  } else {
    ctx.fillStyle = bgColorInput.value;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 设置文字样式
  ctx.fillStyle = textColorInput.value;
  ctx.font = `${fontSizeInput.value}px ${fontFamilyMap[fontFamilySelect.value]}`;
  ctx.textAlign = textAlignSelect.value;
  ctx.textBaseline = 'middle';
  
  // 计算可用��度
  const padding = parseInt(paddingInput.value);
  const maxWidth = canvas.width - (padding * 2);
  
  // 获取文本行
  const lines = getLines(selectedText, maxWidth);
  
  // 计算起始位置
  const lineHeight = parseInt(fontSizeInput.value) * 1.5;
  const totalHeight = lines.length * lineHeight;
  const startY = (canvas.height - totalHeight) / 2;
  
  // 根据对齐方式确定x坐标
  let startX;
  switch (textAlignSelect.value) {
    case 'left':
      startX = padding;
      break;
    case 'right':
      startX = canvas.width - padding;
      break;
    default: // center
      startX = canvas.width / 2;
  }
  
  // 绘制文字
  lines.forEach((line, index) => {
    ctx.fillText(line, startX, startY + (index * lineHeight));
  });
}

// 监听所有样式变化
[
  bgStyleSelect,
  gradientDirectionSelect,
  bgColorInput,
  bgColor2Input,
  textColorInput,
  fontSizeInput,
  fontFamilySelect,
  textAlignSelect,
  paddingInput
].forEach(input => {
  input.addEventListener('input', drawCanvas);
  input.addEventListener('change', drawCanvas);
});

// 监听模板点击事件
document.querySelectorAll('.template-item').forEach(item => {
  item.addEventListener('click', () => {
    const templateName = item.dataset.template;
    applyTemplate(templateName);
  });
});

// 应用模板
function applyTemplate(templateName) {
  const template = templates[templateName];
  if (!template) return;

  // 更新所有控件的值
  bgStyleSelect.value = template.bgStyle;
  gradientDirectionSelect.value = template.gradientDirection;
  bgColorInput.value = template.bgColor;
  bgColor2Input.value = template.bgColor2;
  textColorInput.value = template.textColor;
  fontSizeInput.value = template.fontSize;
  fontFamilySelect.value = template.fontFamily;
  textAlignSelect.value = template.textAlign;
  paddingInput.value = template.padding;

  // 更新显示的值
  fontSizeValue.textContent = `${template.fontSize}px`;
  paddingValue.textContent = `${template.padding}px`;

  // 更新渐变控件的显示状态
  const isGradient = template.bgStyle === 'gradient';
  gradientControls.style.display = isGradient ? 'flex' : 'none';
  bgColor2Input.style.display = isGradient ? 'block' : 'none';

  // 重新绘制画布
  drawCanvas();
}

// 导出PNG
exportBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = '金句.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// 复制到剪贴板
copyBtn.addEventListener('click', async () => {
  try {
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    alert('已复制到剪贴板！');
  } catch (err) {
    alert('复制失败，请重试');
    console.error('复制失败:', err);
  }
}); 