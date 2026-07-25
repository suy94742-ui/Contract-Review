import sys, json

def check_key(data, key, expected):
    actual = data.get(key, '')
    if expected in str(actual):
        print(f"  ✓ {key} = {actual}")
        return True
    else:
        print(f"  ✗ {key} 不匹配 (期望包含: {expected}, 实际: {actual})")
        return False

def main():
    resp_json = sys.argv[1]
    key = sys.argv[2]
    expected = sys.argv[3]
    try:
        data = json.loads(resp_json)
        if check_key(data, key, expected):
            sys.exit(0)
        else:
            sys.exit(1)
    except Exception as e:
        print(f"  ✗ JSON 解析失败: {e}")
        print(f"  响应: {resp_json[:200]}")
        sys.exit(1)

if __name__ == '__main__':
    main()
