#!/usr/bin/env python3
import random
import sys

def quick_generate(count=5):
    areas = ["201", "212", "305", "415", "555", "617", "702", "718", "917"]
    
    print("📱 INSTANT FAKE PHONE + VERIFICATION CODE GENERATOR")
    print("=" * 60)
    print("⚠️  FAKE NUMBERS FOR TESTING ONLY!")
    print("=" * 60)
    
    for i in range(count):
        area = random.choice(areas)
        exchange = random.randint(200, 999)
        number = random.randint(1000, 9999)
        phone = f"+1-{area}-{exchange:03d}-{number:04d}"
        code = f"{random.randint(100000, 999999):06d}"
        
        print(f"{i+1:2d}. 📱 {phone} | 🔐 {code}")
    
    print("\n✅ Generation complete! Use these for testing verification systems.")

if __name__ == "__main__":
    count = 5
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
            count = min(max(count, 1), 50)
        except:
            count = 5
    
    quick_generate(count)