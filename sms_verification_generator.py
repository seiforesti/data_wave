#!/usr/bin/env python3
"""
SMS Verification Phone Number Generator
Simple script to generate fake phone numbers with verification code simulation.
"""

import random
import time
import json
import sys
from datetime import datetime, timedelta

class SMSVerificationGenerator:
    def __init__(self):
        # US area codes for realistic numbers
        self.us_area_codes = [
            "201", "202", "203", "205", "206", "212", "213", "214", "215",
            "216", "217", "301", "302", "303", "304", "305", "310", "312",
            "313", "314", "315", "316", "317", "318", "404", "405", "406",
            "407", "408", "409", "410", "412", "413", "414", "415", "417",
            "501", "502", "503", "504", "505", "510", "512", "513", "515",
            "516", "517", "518", "520", "530", "540", "541", "559", "561",
            "562", "601", "602", "603", "605", "606", "607", "608", "609",
            "610", "612", "614", "615", "616", "617", "618", "619", "620",
            "701", "702", "703", "704", "706", "707", "708", "712", "713",
            "714", "715", "716", "717", "718", "719", "720", "724", "727",
            "801", "802", "803", "804", "805", "806", "808", "810", "812",
            "813", "814", "815", "816", "817", "818", "828", "830", "831",
            "901", "903", "904", "906", "907", "908", "909", "910", "912",
            "913", "914", "915", "916", "917", "918", "919", "920", "925"
        ]
        
        # Store generated numbers with their verification codes
        self.active_numbers = {}
    
    def generate_phone_number(self, country="us", include_country_code=True):
        """Generate a single fake phone number"""
        if country.lower() == "us":
            area_code = random.choice(self.us_area_codes)
            exchange = random.randint(200, 999)
            number = random.randint(1000, 9999)
            phone = f"{area_code}-{exchange:03d}-{number:04d}"
            
            if include_country_code:
                return f"+1-{phone}"
            return phone
        
        elif country.lower() == "uk":
            prefix = random.choice(["7400", "7500", "7600", "7700", "7800", "7900"])
            suffix = random.randint(100000, 999999)
            phone = f"{prefix}-{suffix:06d}"
            
            if include_country_code:
                return f"+44-{phone}"
            return f"0{phone}"
        
        else:
            # Default to US format
            return self.generate_phone_number("us", include_country_code)
    
    def generate_verification_code(self):
        """Generate a 6-digit verification code"""
        return f"{random.randint(100000, 999999):06d}"
    
    def create_verification_session(self, phone_number):
        """Create a verification session for a phone number"""
        code = self.generate_verification_code()
        expiry = datetime.now() + timedelta(minutes=5)  # 5-minute expiry
        
        self.active_numbers[phone_number] = {
            "code": code,
            "expiry": expiry,
            "attempts": 0,
            "created": datetime.now()
        }
        
        return code
    
    def verify_code(self, phone_number, entered_code):
        """Verify a code for a phone number"""
        if phone_number not in self.active_numbers:
            return {"success": False, "message": "No verification session found"}
        
        session = self.active_numbers[phone_number]
        
        # Check if expired
        if datetime.now() > session["expiry"]:
            del self.active_numbers[phone_number]
            return {"success": False, "message": "Verification code expired"}
        
        # Check attempts
        if session["attempts"] >= 3:
            del self.active_numbers[phone_number]
            return {"success": False, "message": "Too many attempts"}
        
        session["attempts"] += 1
        
        # Check code
        if entered_code == session["code"]:
            del self.active_numbers[phone_number]
            return {"success": True, "message": "Verification successful"}
        else:
            return {"success": False, "message": f"Invalid code. Attempts: {session['attempts']}/3"}
    
    def get_active_sessions(self):
        """Get all active verification sessions"""
        current_time = datetime.now()
        active = {}
        
        # Clean up expired sessions
        expired_numbers = []
        for phone, session in self.active_numbers.items():
            if current_time > session["expiry"]:
                expired_numbers.append(phone)
            else:
                active[phone] = {
                    "code": session["code"],
                    "expires_in": str(session["expiry"] - current_time).split(".")[0],
                    "attempts": session["attempts"]
                }
        
        # Remove expired sessions
        for phone in expired_numbers:
            del self.active_numbers[phone]
        
        return active

def print_banner():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║              SMS Verification Generator                      ║")
    print("║            Fake Numbers + Verification Codes                ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()

def interactive_mode():
    """Run interactive SMS verification simulator"""
    generator = SMSVerificationGenerator()
    print_banner()
    print("SMS Verification Simulator - Commands:")
    print("  gen [count] [country]  - Generate phone numbers")
    print("  send <phone>           - Send verification code to phone")
    print("  verify <phone> <code>  - Verify code for phone")
    print("  list                   - List active sessions")
    print("  help                   - Show this help")
    print("  quit                   - Exit")
    print()
    
    while True:
        try:
            command = input("sms-verify> ").strip().split()
            
            if not command:
                continue
                
            cmd = command[0].lower()
            
            if cmd in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
                
            elif cmd == 'help':
                print("\nCommands:")
                print("  gen [count] [country]  - Generate phone numbers (default: 1 us)")
                print("  send <phone>           - Send verification code to phone")
                print("  verify <phone> <code>  - Verify code for phone")
                print("  list                   - List active verification sessions")
                print("  clear                  - Clear all active sessions")
                print("  help                   - Show this help")
                print("  quit                   - Exit")
                print()
                
            elif cmd == 'gen':
                count = 1
                country = "us"
                
                if len(command) > 1:
                    try:
                        count = int(command[1])
                    except ValueError:
                        country = command[1]
                        
                if len(command) > 2:
                    country = command[2]
                
                print(f"\nGenerated {count} phone number(s):")
                for i in range(count):
                    phone = generator.generate_phone_number(country)
                    print(f"  {i+1}. {phone}")
                print()
                
            elif cmd == 'send':
                if len(command) < 2:
                    print("Usage: send <phone_number>")
                    continue
                
                phone = command[1]
                code = generator.create_verification_session(phone)
                print(f"\n📱 SMS sent to {phone}")
                print(f"🔐 Verification code: {code}")
                print("⏰ Expires in 5 minutes")
                print()
                
            elif cmd == 'verify':
                if len(command) < 3:
                    print("Usage: verify <phone_number> <code>")
                    continue
                
                phone = command[1]
                code = command[2]
                result = generator.verify_code(phone, code)
                
                if result["success"]:
                    print(f"✅ {result['message']}")
                else:
                    print(f"❌ {result['message']}")
                print()
                
            elif cmd == 'list':
                sessions = generator.get_active_sessions()
                if sessions:
                    print("\nActive verification sessions:")
                    print("-" * 50)
                    for phone, info in sessions.items():
                        print(f"📱 {phone}")
                        print(f"   Code: {info['code']}")
                        print(f"   Expires in: {info['expires_in']}")
                        print(f"   Attempts: {info['attempts']}/3")
                        print()
                else:
                    print("\nNo active verification sessions.")
                    print()
                    
            elif cmd == 'clear':
                generator.active_numbers.clear()
                print("✅ All verification sessions cleared.")
                print()
                
            else:
                print(f"Unknown command: {cmd}. Type 'help' for available commands.")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

def main():
    """Main function"""
    if len(sys.argv) == 1:
        # No arguments, run interactive mode
        interactive_mode()
        return
    
    # Parse command line arguments
    generator = SMSVerificationGenerator()
    
    if "--help" in sys.argv or "-h" in sys.argv:
        print_help()
        return
    
    # Simple command line interface
    count = 1
    country = "us"
    format_type = "text"
    include_country_code = True
    
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        
        if arg == "--count" or arg == "-c":
            if i + 1 < len(sys.argv):
                count = int(sys.argv[i + 1])
                i += 1
        elif arg == "--country":
            if i + 1 < len(sys.argv):
                country = sys.argv[i + 1]
                i += 1
        elif arg == "--format":
            if i + 1 < len(sys.argv):
                format_type = sys.argv[i + 1]
                i += 1
        elif arg == "--no-country-code":
            include_country_code = False
        elif arg == "--interactive" or arg == "-i":
            interactive_mode()
            return
        
        i += 1
    
    # Generate numbers
    print_banner()
    print(f"Generated {count} phone number(s) for {country.upper()}:")
    print("=" * 50)
    
    for i in range(count):
        phone = generator.generate_phone_number(country, include_country_code)
        if format_type == "json":
            data = {"phone": phone, "country": country}
            print(json.dumps(data))
        else:
            print(f"  {i+1}. {phone}")
    
    print()
    print("💡 Tip: Run without arguments for interactive SMS verification simulator!")

def print_help():
    """Print help information"""
    help_text = """
SMS Verification Phone Number Generator

USAGE:
    python3 sms_verification_generator.py [OPTIONS]
    
    Run without arguments for interactive SMS verification simulator!

OPTIONS:
    --count, -c <number>     Number of phone numbers to generate (default: 1)
    --country <code>         Country code: us, uk (default: us)
    --format <type>          Output format: text, json (default: text)
    --no-country-code        Generate without country code prefix
    --interactive, -i        Run interactive SMS verification simulator
    --help, -h              Show this help

INTERACTIVE MODE:
    gen [count] [country]    Generate phone numbers
    send <phone>             Send verification code to phone
    verify <phone> <code>    Verify code for phone
    list                     List active verification sessions
    clear                    Clear all sessions
    quit                     Exit

EXAMPLES:
    python3 sms_verification_generator.py
    python3 sms_verification_generator.py --count 5
    python3 sms_verification_generator.py --country uk --count 3
    python3 sms_verification_generator.py --interactive

NOTE: This generates FAKE phone numbers for testing only!
"""
    print(help_text)

if __name__ == "__main__":
    main()