#!/usr/bin/env python3

import random

def generate_us_phone():
    """Generate a fake US phone number"""
    area_codes = ["201", "202", "212", "213", "214", "305", "310", "312", "404", "415", "512", "555", "617", "702", "718", "773", "818", "917"]
    area_code = random.choice(area_codes)
    exchange = random.randint(200, 999)
    number = random.randint(1000, 9999)
    return f"+1-{area_code}-{exchange:03d}-{number:04d}"

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return f"{random.randint(100000, 999999):06d}"

def main():
    print("=" * 60)
    print("📱 FAKE PHONE NUMBER GENERATOR FOR SMS VERIFICATION")
    print("=" * 60)
    print()
    
    while True:
        print("Choose an option:")
        print("1. Generate fake phone numbers")
        print("2. Generate verification code")
        print("3. Generate phone + code combo")
        print("4. Quit")
        print()
        
        choice = input("Enter choice (1-4): ").strip()
        
        if choice == "1":
            try:
                count = int(input("How many phone numbers? (1-50): ") or "1")
                count = min(max(count, 1), 50)
                
                print(f"\n📱 Generated {count} fake phone numbers:")
                print("-" * 40)
                for i in range(count):
                    phone = generate_us_phone()
                    print(f"{i+1:2d}. {phone}")
                print()
                
            except ValueError:
                print("Invalid number. Try again.\n")
        
        elif choice == "2":
            try:
                count = int(input("How many codes? (1-20): ") or "1")
                count = min(max(count, 1), 20)
                
                print(f"\n🔐 Generated {count} verification codes:")
                print("-" * 40)
                for i in range(count):
                    code = generate_verification_code()
                    print(f"{i+1:2d}. {code}")
                print()
                
            except ValueError:
                print("Invalid number. Try again.\n")
        
        elif choice == "3":
            try:
                count = int(input("How many phone+code pairs? (1-20): ") or "1")
                count = min(max(count, 1), 20)
                
                print(f"\n📱🔐 Generated {count} phone + verification code pairs:")
                print("-" * 60)
                for i in range(count):
                    phone = generate_us_phone()
                    code = generate_verification_code()
                    print(f"{i+1:2d}. Phone: {phone}  |  Code: {code}")
                print()
                
            except ValueError:
                print("Invalid number. Try again.\n")
        
        elif choice == "4":
            print("👋 Goodbye!")
            break
        
        else:
            print("Invalid choice. Please enter 1, 2, 3, or 4.\n")

if __name__ == "__main__":
    main()