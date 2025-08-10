#!/usr/bin/env python3

import random

# Quick test of phone number generation
def test_phone_gen():
    area_codes = ["201", "212", "213", "305", "415", "555", "617", "702", "718"]
    
    print("🧪 Testing phone number generation...")
    print()
    
    for i in range(5):
        area_code = random.choice(area_codes)
        exchange = random.randint(200, 999)
        number = random.randint(1000, 9999)
        phone = f"+1-{area_code}-{exchange:03d}-{number:04d}"
        code = f"{random.randint(100000, 999999):06d}"
        
        print(f"{i+1}. Phone: {phone}  |  Verification Code: {code}")
    
    print()
    print("✅ Phone generation test completed!")

if __name__ == "__main__":
    test_phone_gen()