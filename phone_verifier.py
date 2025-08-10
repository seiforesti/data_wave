#!/usr/bin/env python3
"""
Ultimate SMS Verification Generator
Simple, working script for fake phone numbers and verification codes
"""

import random
import sys

class PhoneVerifier:
    def __init__(self):
        self.area_codes = [
            "201", "202", "212", "213", "214", "215", "216", "305", "310", 
            "312", "313", "404", "415", "512", "555", "617", "702", "718", 
            "773", "818", "917", "925", "949", "972"
        ]
        self.active_codes = {}
    
    def generate_phone(self, country="us"):
        """Generate fake phone number"""
        if country.lower() == "us":
            area = random.choice(self.area_codes)
            exchange = random.randint(200, 999)
            number = random.randint(1000, 9999)
            return f"+1-{area}-{exchange:03d}-{number:04d}"
        elif country.lower() == "uk":
            prefix = random.choice(["7400", "7500", "7700", "7800"])
            suffix = random.randint(100000, 999999)
            return f"+44-{prefix}-{suffix:06d}"
        else:
            return self.generate_phone("us")
    
    def generate_code(self):
        """Generate 6-digit verification code"""
        return f"{random.randint(100000, 999999):06d}"
    
    def send_sms(self, phone):
        """Simulate sending SMS verification"""
        code = self.generate_code()
        self.active_codes[phone] = code
        return code
    
    def verify(self, phone, entered_code):
        """Verify the code"""
        if phone in self.active_codes:
            if self.active_codes[phone] == entered_code:
                del self.active_codes[phone]
                return True
            else:
                return False
        return False

def print_header():
    print("\n" + "="*70)
    print("📱 SMS VERIFICATION GENERATOR - FAKE NUMBERS FOR TESTING")
    print("="*70)
    print("⚠️  WARNING: These are FAKE numbers for testing only!")
    print("="*70)

def main_menu():
    verifier = PhoneVerifier()
    
    while True:
        print_header()
        print("\n🎯 MAIN MENU:")
        print("1️⃣  Generate fake phone numbers")
        print("2️⃣  Generate verification codes")
        print("3️⃣  Full SMS verification simulation")
        print("4️⃣  Quick phone + code generator")
        print("5️⃣  Exit")
        print()
        
        try:
            choice = input("👉 Select option (1-5): ").strip()
            
            if choice == "1":
                generate_phones_menu(verifier)
            elif choice == "2":
                generate_codes_menu(verifier)
            elif choice == "3":
                sms_simulation_menu(verifier)
            elif choice == "4":
                quick_generator(verifier)
            elif choice == "5":
                print("\n👋 Thanks for using SMS Verification Generator!")
                print("💡 Remember: Use these FAKE numbers for testing only!")
                break
            else:
                print("\n❌ Invalid choice. Please enter 1-5.")
                input("Press Enter to continue...")
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            input("Press Enter to continue...")

def generate_phones_menu(verifier):
    """Phone number generation menu"""
    print("\n📱 PHONE NUMBER GENERATOR")
    print("-" * 40)
    
    try:
        count = input("How many numbers? (1-100, default=5): ").strip()
        count = int(count) if count else 5
        count = min(max(count, 1), 100)
        
        country = input("Country (us/uk, default=us): ").strip().lower()
        if country not in ["us", "uk"]:
            country = "us"
        
        print(f"\n📱 Generated {count} fake {country.upper()} phone numbers:")
        print("=" * 50)
        
        for i in range(count):
            phone = verifier.generate_phone(country)
            print(f"{i+1:3d}. {phone}")
        
        print(f"\n✅ Generated {count} fake phone numbers successfully!")
        
    except ValueError:
        print("❌ Invalid input. Using defaults.")
        for i in range(5):
            phone = verifier.generate_phone("us")
            print(f"{i+1}. {phone}")
    
    input("\nPress Enter to return to main menu...")

def generate_codes_menu(verifier):
    """Verification code generation menu"""
    print("\n🔐 VERIFICATION CODE GENERATOR")
    print("-" * 40)
    
    try:
        count = input("How many codes? (1-50, default=10): ").strip()
        count = int(count) if count else 10
        count = min(max(count, 1), 50)
        
        print(f"\n🔐 Generated {count} verification codes:")
        print("=" * 40)
        
        for i in range(count):
            code = verifier.generate_code()
            print(f"{i+1:3d}. {code}")
        
        print(f"\n✅ Generated {count} verification codes successfully!")
        
    except ValueError:
        print("❌ Invalid input. Using default.")
        for i in range(10):
            code = verifier.generate_code()
            print(f"{i+1}. {code}")
    
    input("\nPress Enter to return to main menu...")

def sms_simulation_menu(verifier):
    """Full SMS verification simulation"""
    print("\n📨 SMS VERIFICATION SIMULATION")
    print("-" * 40)
    print("This simulates the complete SMS verification process")
    print()
    
    # Step 1: Generate or enter phone
    print("Step 1: Get phone number")
    choice = input("Generate new phone (g) or enter your own (e)? [g/e]: ").strip().lower()
    
    if choice == "e":
        phone = input("Enter phone number: ").strip()
    else:
        phone = verifier.generate_phone("us")
        print(f"📱 Generated phone: {phone}")
    
    # Step 2: Send verification
    print(f"\nStep 2: Sending SMS to {phone}")
    code = verifier.send_sms(phone)
    print(f"📨 SMS sent!")
    print(f"🔐 Verification code: {code}")
    print("(In real life, you'd receive this via SMS)")
    
    # Step 3: Verify code
    print(f"\nStep 3: Verification")
    attempts = 0
    max_attempts = 3
    
    while attempts < max_attempts:
        entered_code = input(f"Enter the verification code: ").strip()
        
        if verifier.verify(phone, entered_code):
            print("✅ VERIFICATION SUCCESSFUL!")
            print("🎉 Phone number verified!")
            break
        else:
            attempts += 1
            remaining = max_attempts - attempts
            if remaining > 0:
                print(f"❌ Wrong code. {remaining} attempts remaining.")
            else:
                print("❌ Verification failed. Too many attempts.")
                break
    
    input("\nPress Enter to return to main menu...")

def quick_generator(verifier):
    """Quick phone + code generator"""
    print("\n⚡ QUICK GENERATOR")
    print("-" * 40)
    
    try:
        count = input("How many phone+code pairs? (1-20, default=3): ").strip()
        count = int(count) if count else 3
        count = min(max(count, 1), 20)
        
        print(f"\n⚡ Generated {count} phone + verification code pairs:")
        print("=" * 70)
        
        for i in range(count):
            phone = verifier.generate_phone("us")
            code = verifier.generate_code()
            print(f"{i+1:2d}. 📱 {phone:<20} | 🔐 {code}")
        
        print(f"\n✅ Quick generation completed!")
        
    except ValueError:
        print("❌ Invalid input. Using default.")
        for i in range(3):
            phone = verifier.generate_phone("us")
            code = verifier.generate_code()
            print(f"{i+1}. 📱 {phone} | 🔐 {code}")
    
    input("\nPress Enter to return to main menu...")

if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("Please try again.")