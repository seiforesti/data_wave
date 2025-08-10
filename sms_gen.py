#!/usr/bin/env python3

import random

print("📱 SMS VERIFICATION GENERATOR")
print("=" * 50)
print("⚠️  FAKE NUMBERS FOR TESTING ONLY!")
print("=" * 50)

def generate_phone():
    areas = ["201", "212", "305", "415", "555", "617", "702", "718", "917"]
    area = random.choice(areas)
    exchange = random.randint(200, 999)
    number = random.randint(1000, 9999)
    return f"+1-{area}-{exchange:03d}-{number:04d}"

def generate_code():
    return f"{random.randint(100000, 999999):06d}"

while True:
    print("\n🎯 OPTIONS:")
    print("1 = Generate phone numbers")
    print("2 = Generate verification codes") 
    print("3 = Generate phone + code pairs")
    print("4 = Exit")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        try:
            count = int(input("How many phones? (1-20): ") or "5")
            count = min(max(count, 1), 20)
            
            print(f"\n📱 {count} FAKE PHONE NUMBERS:")
            for i in range(count):
                print(f"{i+1:2d}. {generate_phone()}")
        except:
            print("❌ Error. Generating 5 numbers:")
            for i in range(5):
                print(f"{i+1}. {generate_phone()}")
    
    elif choice == "2":
        try:
            count = int(input("How many codes? (1-20): ") or "10")
            count = min(max(count, 1), 20)
            
            print(f"\n🔐 {count} VERIFICATION CODES:")
            for i in range(count):
                print(f"{i+1:2d}. {generate_code()}")
        except:
            print("❌ Error. Generating 10 codes:")
            for i in range(10):
                print(f"{i+1}. {generate_code()}")
    
    elif choice == "3":
        try:
            count = int(input("How many pairs? (1-10): ") or "3")
            count = min(max(count, 1), 10)
            
            print(f"\n📱🔐 {count} PHONE + CODE PAIRS:")
            for i in range(count):
                phone = generate_phone()
                code = generate_code()
                print(f"{i+1:2d}. {phone} | {code}")
        except:
            print("❌ Error. Generating 3 pairs:")
            for i in range(3):
                phone = generate_phone()
                code = generate_code()
                print(f"{i+1}. {phone} | {code}")
    
    elif choice == "4":
        print("\n👋 Goodbye!")
        break
    
    else:
        print("❌ Invalid choice. Enter 1, 2, 3, or 4.")
    
    input("\nPress Enter to continue...")