import re
import os

# 读取文件
md_file = r"D:\openclaw_pro\001\New folder\DAO_DE_JING\道德经\其他\理解《道德经》.md"
output_dir = r"D:\openclaw_pro\001\New folder\DAO_DE_JING\道德经\其他\理解道德经"

os.makedirs(output_dir, exist_ok=True)

with open(md_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 按章节分割 (## 开头的是新章节)
# 使用正则匹配章节标题
pattern = r'^(# .+)$'
matches = list(re.finditer(pattern, content, re.MULTILINE))

print(f"找到 {len(matches)} 个章节")

# 提取所有章节
for i, match in enumerate(matches):
    start = match.start()
    # 找到下一个章节或文件结尾
    if i + 1 < len(matches):
        end = matches[i + 1].start()
    else:
        end = len(content)
    
    chapter = content[start:end].strip()
    
    # 提取标题作为文件名
    title_match = re.match(r'# (.+)', chapter)
    if title_match:
        title = title_match.group(1)
        # 清理文件名
        filename = re.sub(r'[<>:"/\\|?*]', '_', title)[:50]
        filename = f"{i+1:02d}-{filename}.md"
    else:
        filename = f"{i+1:02d}-未知章节.md"
    
    # 保存文件
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(chapter)
    
    print(f"保存: {filename}")

print(f"\n完成！共 {len(matches)} 个章节")
print(f"输出目录: {output_dir}")
