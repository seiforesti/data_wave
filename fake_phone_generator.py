#!/usr/bin/env python3
"""
Fake Phone Number Generator
A comprehensive script to generate fake phone numbers for testing verification systems.
Supports multiple countries and formats.
"""

import random
import argparse
import sys
import json
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

class CountryCode(Enum):
    """Supported country codes with their phone number patterns"""
    US = "us"
    UK = "uk"
    CANADA = "ca"
    AUSTRALIA = "au"
    GERMANY = "de"
    FRANCE = "fr"
    ITALY = "it"
    SPAIN = "es"
    BRAZIL = "br"
    INDIA = "in"

@dataclass
class PhoneFormat:
    """Phone number format configuration"""
    country: str
    country_code: str
    pattern: str
    example: str
    description: str

class PhoneNumberGenerator:
    """Main class for generating fake phone numbers"""
    
    def __init__(self):
        self.formats = {
            CountryCode.US: PhoneFormat(
                country="United States",
                country_code="+1",
                pattern="XXX-XXX-XXXX",
                example="+1-555-123-4567",
                description="US format with area code"
            ),
            CountryCode.UK: PhoneFormat(
                country="United Kingdom",
                country_code="+44",
                pattern="XXXX XXX XXXX",
                example="+44-7700-123456",
                description="UK mobile format"
            ),
            CountryCode.CANADA: PhoneFormat(
                country="Canada",
                country_code="+1",
                pattern="XXX-XXX-XXXX",
                example="+1-416-123-4567",
                description="Canadian format (same as US)"
            ),
            CountryCode.AUSTRALIA: PhoneFormat(
                country="Australia",
                country_code="+61",
                pattern="XXX XXX XXX",
                example="+61-412-345-678",
                description="Australian mobile format"
            ),
            CountryCode.GERMANY: PhoneFormat(
                country="Germany",
                country_code="+49",
                pattern="XXX XXXXXXXX",
                example="+49-172-12345678",
                description="German mobile format"
            ),
            CountryCode.FRANCE: PhoneFormat(
                country="France",
                country_code="+33",
                pattern="X XX XX XX XX",
                example="+33-6-12-34-56-78",
                description="French mobile format"
            ),
            CountryCode.ITALY: PhoneFormat(
                country="Italy",
                country_code="+39",
                pattern="XXX XXX XXXX",
                example="+39-320-123-4567",
                description="Italian mobile format"
            ),
            CountryCode.SPAIN: PhoneFormat(
                country="Spain",
                country_code="+34",
                pattern="XXX XX XX XX",
                example="+34-612-34-56-78",
                description="Spanish mobile format"
            ),
            CountryCode.BRAZIL: PhoneFormat(
                country="Brazil",
                country_code="+55",
                pattern="XX XXXXX-XXXX",
                example="+55-11-91234-5678",
                description="Brazilian mobile format"
            ),
            CountryCode.INDIA: PhoneFormat(
                country="India",
                country_code="+91",
                pattern="XXXXX XXXXX",
                example="+91-98765-43210",
                description="Indian mobile format"
            )
        }
        
        # Valid area codes and prefixes for more realistic numbers
        self.us_area_codes = [
            "201", "202", "203", "205", "206", "207", "208", "209", "210",
            "212", "213", "214", "215", "216", "217", "218", "219", "224",
            "225", "228", "229", "231", "234", "239", "240", "248", "251",
            "252", "253", "254", "256", "260", "262", "267", "269", "270",
            "276", "281", "301", "302", "303", "304", "305", "307", "308",
            "309", "310", "312", "313", "314", "315", "316", "317", "318",
            "319", "320", "321", "323", "325", "330", "331", "334", "336",
            "337", "339", "347", "351", "352", "360", "361", "386", "401",
            "402", "404", "405", "406", "407", "408", "409", "410", "412",
            "413", "414", "415", "417", "419", "423", "424", "425", "430",
            "432", "434", "435", "440", "443", "445", "458", "469", "470",
            "475", "478", "479", "480", "484", "501", "502", "503", "504",
            "505", "507", "508", "509", "510", "512", "513", "515", "516",
            "517", "518", "520", "530", "540", "541", "551", "559", "561",
            "562", "563", "564", "567", "570", "571", "573", "574", "575",
            "580", "585", "586", "601", "602", "603", "605", "606", "607",
            "608", "609", "610", "612", "614", "615", "616", "617", "618",
            "619", "620", "623", "626", "630", "631", "636", "641", "646",
            "650", "651", "660", "661", "662", "667", "678", "682", "701",
            "702", "703", "704", "706", "707", "708", "712", "713", "714",
            "715", "716", "717", "718", "719", "720", "724", "727", "731",
            "732", "734", "737", "740", "747", "754", "757", "760", "763",
            "765", "770", "772", "773", "774", "775", "781", "785", "786",
            "801", "802", "803", "804", "805", "806", "808", "810", "812",
            "813", "814", "815", "816", "817", "818", "828", "830", "831",
            "832", "843", "845", "847", "848", "850", "856", "857", "858",
            "859", "860", "862", "863", "864", "865", "870", "872", "878",
            "901", "903", "904", "906", "907", "908", "909", "910", "912",
            "913", "914", "915", "916", "917", "918", "919", "920", "925",
            "928", "929", "931", "936", "937", "940", "941", "947", "949",
            "951", "952", "954", "956", "959", "970", "971", "972", "973",
            "978", "979", "980", "984", "985", "989"
        ]
        
        self.uk_mobile_prefixes = [
            "7400", "7401", "7402", "7403", "7404", "7405", "7406", "7407",
            "7408", "7409", "7410", "7411", "7412", "7413", "7414", "7415",
            "7416", "7417", "7418", "7419", "7420", "7421", "7422", "7423",
            "7424", "7425", "7426", "7427", "7428", "7429", "7430", "7431",
            "7432", "7433", "7434", "7435", "7436", "7437", "7438", "7439",
            "7440", "7441", "7442", "7443", "7444", "7445", "7446", "7447",
            "7448", "7449", "7450", "7451", "7452", "7453", "7454", "7455",
            "7456", "7457", "7458", "7459", "7460", "7461", "7462", "7463",
            "7464", "7465", "7466", "7467", "7468", "7469", "7470", "7471",
            "7472", "7473", "7474", "7475", "7476", "7477", "7478", "7479",
            "7480", "7481", "7482", "7483", "7484", "7485", "7486", "7487",
            "7488", "7489", "7490", "7491", "7492", "7493", "7494", "7495",
            "7496", "7497", "7498", "7499", "7500", "7501", "7502", "7503",
            "7504", "7505", "7506", "7507", "7508", "7509", "7700", "7701",
            "7702", "7703", "7704", "7705", "7706", "7707", "7708", "7709",
            "7710", "7711", "7712", "7713", "7714", "7715", "7716", "7717",
            "7718", "7719", "7720", "7721", "7722", "7723", "7724", "7725",
            "7726", "7727", "7728", "7729", "7730", "7731", "7732", "7733",
            "7734", "7735", "7736", "7737", "7738", "7739", "7740", "7741",
            "7742", "7743", "7744", "7745", "7746", "7747", "7748", "7749",
            "7750", "7751", "7752", "7753", "7754", "7755", "7756", "7757",
            "7758", "7759", "7760", "7761", "7762", "7763", "7764", "7765",
            "7766", "7767", "7768", "7769", "7770", "7771", "7772", "7773",
            "7774", "7775", "7776", "7777", "7778", "7779", "7780", "7781",
            "7782", "7783", "7784", "7785", "7786", "7787", "7788", "7789",
            "7790", "7791", "7792", "7793", "7794", "7795", "7796", "7797",
            "7798", "7799", "7800", "7801", "7802", "7803", "7804", "7805",
            "7806", "7807", "7808", "7809", "7810", "7811", "7812", "7813",
            "7814", "7815", "7816", "7817", "7818", "7819", "7820", "7821",
            "7822", "7823", "7824", "7825", "7826", "7827", "7828", "7829",
            "7830", "7831", "7832", "7833", "7834", "7835", "7836", "7837",
            "7838", "7839", "7840", "7841", "7842", "7843", "7844", "7845",
            "7846", "7847", "7848", "7849", "7850", "7851", "7852", "7853",
            "7854", "7855", "7856", "7857", "7858", "7859", "7860", "7861",
            "7862", "7863", "7864", "7865", "7866", "7867", "7868", "7869",
            "7870", "7871", "7872", "7873", "7874", "7875", "7876", "7877",
            "7878", "7879", "7880", "7881", "7882", "7883", "7884", "7885",
            "7886", "7887", "7888", "7889", "7890", "7891", "7892", "7893",
            "7894", "7895", "7896", "7897", "7898", "7899", "7900", "7901",
            "7902", "7903", "7904", "7905", "7906", "7907", "7908", "7909",
            "7910", "7911", "7912", "7913", "7914", "7915", "7916", "7917",
            "7918", "7919", "7920", "7921", "7922", "7923", "7924", "7925",
            "7926", "7927", "7928", "7929", "7930", "7931", "7932", "7933",
            "7934", "7935", "7936", "7937", "7938", "7939", "7940", "7941",
            "7942", "7943", "7944", "7945", "7946", "7947", "7948", "7949",
            "7950", "7951", "7952", "7953", "7954", "7955", "7956", "7957",
            "7958", "7959", "7960", "7961", "7962", "7963", "7964", "7965",
            "7966", "7967", "7968", "7969", "7970", "7971", "7972", "7973",
            "7974", "7975", "7976", "7977", "7978", "7979", "7980", "7981",
            "7982", "7983", "7984", "7985", "7986", "7987", "7988", "7989",
            "7990", "7991", "7992", "7993", "7994", "7995", "7996", "7997",
            "7998", "7999"
        ]

    def generate_us_number(self, include_country_code: bool = True) -> str:
        """Generate a fake US phone number"""
        area_code = random.choice(self.us_area_codes)
        exchange = random.randint(200, 999)  # Avoid 0xx and 1xx exchanges
        number = random.randint(1000, 9999)
        
        phone = f"{area_code}-{exchange:03d}-{number:04d}"
        
        if include_country_code:
            return f"+1-{phone}"
        return phone

    def generate_uk_number(self, include_country_code: bool = True) -> str:
        """Generate a fake UK mobile number"""
        prefix = random.choice(self.uk_mobile_prefixes)
        suffix = random.randint(100000, 999999)
        
        phone = f"{prefix}-{suffix:06d}"
        
        if include_country_code:
            return f"+44-{phone}"
        return f"0{phone}"

    def generate_canada_number(self, include_country_code: bool = True) -> str:
        """Generate a fake Canadian phone number"""
        # Canadian numbers use same format as US
        return self.generate_us_number(include_country_code)

    def generate_australia_number(self, include_country_code: bool = True) -> str:
        """Generate a fake Australian mobile number"""
        # Australian mobile numbers start with 04
        first_digit = 4
        remaining = random.randint(10000000, 99999999)
        
        phone = f"0{first_digit}-{str(remaining)[:4]}-{str(remaining)[4:]}"
        
        if include_country_code:
            return f"+61-{phone[1:]}"  # Remove the leading 0 for international format
        return phone

    def generate_germany_number(self, include_country_code: bool = True) -> str:
        """Generate a fake German mobile number"""
        # German mobile numbers typically start with 15, 16, or 17
        prefix = random.choice(["15", "16", "17"])
        remaining = random.randint(10000000, 99999999)
        
        phone = f"{prefix}{remaining}"
        formatted = f"{phone[:3]}-{phone[3:]}"
        
        if include_country_code:
            return f"+49-{formatted}"
        return f"0{formatted}"

    def generate_france_number(self, include_country_code: bool = True) -> str:
        """Generate a fake French mobile number"""
        # French mobile numbers start with 06 or 07
        prefix = random.choice(["06", "07"])
        remaining = random.randint(10000000, 99999999)
        
        phone = f"{prefix}{remaining:08d}"
        formatted = f"{phone[:1]}-{phone[1:3]}-{phone[3:5]}-{phone[5:7]}-{phone[7:9]}"
        
        if include_country_code:
            return f"+33-{formatted}"
        return f"0{formatted}"

    def generate_italy_number(self, include_country_code: bool = True) -> str:
        """Generate a fake Italian mobile number"""
        # Italian mobile numbers typically start with 32, 33, 34, 36, 37, 38, 39
        prefix = random.choice(["32", "33", "34", "36", "37", "38", "39"])
        remaining = random.randint(10000000, 99999999)
        
        phone = f"{prefix}{remaining:08d}"
        formatted = f"{phone[:3]}-{phone[3:6]}-{phone[6:]}"
        
        if include_country_code:
            return f"+39-{formatted}"
        return f"0{formatted}"

    def generate_spain_number(self, include_country_code: bool = True) -> str:
        """Generate a fake Spanish mobile number"""
        # Spanish mobile numbers start with 6 or 7
        first_digit = random.choice([6, 7])
        remaining = random.randint(10000000, 99999999)
        
        phone = f"{first_digit}{remaining:08d}"
        formatted = f"{phone[:3]}-{phone[3:5]}-{phone[5:7]}-{phone[7:9]}"
        
        if include_country_code:
            return f"+34-{formatted}"
        return formatted

    def generate_brazil_number(self, include_country_code: bool = True) -> str:
        """Generate a fake Brazilian mobile number"""
        # Brazilian mobile numbers: area code (11-99) + 9 + 8 digits
        area_code = random.randint(11, 99)
        first_digit = 9  # Mobile numbers start with 9
        remaining = random.randint(10000000, 99999999)
        
        phone = f"{area_code:02d}9{remaining:08d}"
        formatted = f"{phone[:2]}-{phone[2:7]}-{phone[7:]}"
        
        if include_country_code:
            return f"+55-{formatted}"
        return formatted

    def generate_india_number(self, include_country_code: bool = True) -> str:
        """Generate a fake Indian mobile number"""
        # Indian mobile numbers start with 6, 7, 8, or 9
        first_digit = random.choice([6, 7, 8, 9])
        remaining = random.randint(1000000000, 9999999999)
        
        phone = f"{first_digit}{remaining:09d}"
        formatted = f"{phone[:5]}-{phone[5:]}"
        
        if include_country_code:
            return f"+91-{formatted}"
        return formatted

    def generate_number(self, country: CountryCode, include_country_code: bool = True) -> str:
        """Generate a fake phone number for the specified country"""
        generators = {
            CountryCode.US: self.generate_us_number,
            CountryCode.UK: self.generate_uk_number,
            CountryCode.CANADA: self.generate_canada_number,
            CountryCode.AUSTRALIA: self.generate_australia_number,
            CountryCode.GERMANY: self.generate_germany_number,
            CountryCode.FRANCE: self.generate_france_number,
            CountryCode.ITALY: self.generate_italy_number,
            CountryCode.SPAIN: self.generate_spain_number,
            CountryCode.BRAZIL: self.generate_brazil_number,
            CountryCode.INDIA: self.generate_india_number,
        }
        
        return generators[country](include_country_code)

    def generate_multiple(self, count: int, country: CountryCode, 
                         include_country_code: bool = True, unique: bool = True) -> List[str]:
        """Generate multiple fake phone numbers"""
        numbers = []
        attempts = 0
        max_attempts = count * 10  # Prevent infinite loops
        
        while len(numbers) < count and attempts < max_attempts:
            number = self.generate_number(country, include_country_code)
            
            if unique and number in numbers:
                attempts += 1
                continue
                
            numbers.append(number)
            attempts += 1
        
        return numbers

    def get_format_info(self, country: CountryCode) -> PhoneFormat:
        """Get format information for a country"""
        return self.formats[country]

    def list_supported_countries(self) -> Dict[str, PhoneFormat]:
        """List all supported countries and their formats"""
        return {country.value: self.formats[country] for country in CountryCode}

def print_banner():
    """Print application banner"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                 Fake Phone Number Generator                  ║
║              For Testing Verification Systems                ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def print_supported_countries(generator: PhoneNumberGenerator):
    """Print all supported countries and their formats"""
    print("Supported Countries and Formats:")
    print("=" * 50)
    
    countries = generator.list_supported_countries()
    for code, format_info in countries.items():
        print(f"Code: {code.upper()}")
        print(f"Country: {format_info.country}")
        print(f"Format: {format_info.description}")
        print(f"Example: {format_info.example}")
        print("-" * 30)

def validate_country_code(country_str: str) -> Optional[CountryCode]:
    """Validate and convert country string to CountryCode enum"""
    try:
        return CountryCode(country_str.lower())
    except ValueError:
        return None

def main():
    """Main function with CLI interface"""
    parser = argparse.ArgumentParser(
        description="Generate fake phone numbers for testing verification systems",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --country us --count 5
  %(prog)s --country uk --count 10 --no-country-code
  %(prog)s --country de --count 3 --format json
  %(prog)s --list-countries
  %(prog)s --interactive

Note: This tool generates FAKE phone numbers for testing purposes only.
Do not use these numbers for actual communication or verification.
        """
    )
    
    parser.add_argument(
        "--country", "-c",
        type=str,
        default="us",
        help="Country code (us, uk, ca, au, de, fr, it, es, br, in). Default: us"
    )
    
    parser.add_argument(
        "--count", "-n",
        type=int,
        default=1,
        help="Number of phone numbers to generate. Default: 1"
    )
    
    parser.add_argument(
        "--no-country-code",
        action="store_true",
        help="Generate numbers without country code prefix"
    )
    
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json", "csv"],
        default="text",
        help="Output format. Default: text"
    )
    
    parser.add_argument(
        "--unique",
        action="store_true",
        default=True,
        help="Ensure all generated numbers are unique (default: True)"
    )
    
    parser.add_argument(
        "--list-countries", "-l",
        action="store_true",
        help="List all supported countries and their formats"
    )
    
    parser.add_argument(
        "--interactive", "-i",
        action="store_true",
        help="Run in interactive mode"
    )
    
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Suppress banner and extra output"
    )

    args = parser.parse_args()
    
    if not args.quiet:
        print_banner()
    
    generator = PhoneNumberGenerator()
    
    # List countries mode
    if args.list_countries:
        print_supported_countries(generator)
        return
    
    # Interactive mode
    if args.interactive:
        run_interactive_mode(generator)
        return
    
    # Validate country code
    country = validate_country_code(args.country)
    if country is None:
        print(f"Error: Unsupported country code '{args.country}'")
        print("Use --list-countries to see supported countries")
        sys.exit(1)
    
    # Validate count
    if args.count < 1 or args.count > 1000:
        print("Error: Count must be between 1 and 1000")
        sys.exit(1)
    
    # Generate numbers
    try:
        include_country_code = not args.no_country_code
        numbers = generator.generate_multiple(
            args.count, 
            country, 
            include_country_code, 
            args.unique
        )
        
        # Output results
        output_numbers(numbers, args.format, country, generator)
        
    except Exception as e:
        print(f"Error generating numbers: {e}")
        sys.exit(1)

def run_interactive_mode(generator: PhoneNumberGenerator):
    """Run the generator in interactive mode"""
    print("Interactive Mode - Type 'help' for commands, 'quit' to exit")
    print()
    
    while True:
        try:
            command = input("phone-gen> ").strip().lower()
            
            if command in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            elif command in ['help', 'h']:
                print_interactive_help()
            elif command in ['list', 'countries', 'l']:
                print_supported_countries(generator)
            elif command.startswith('gen'):
                handle_interactive_generation(command, generator)
            else:
                print("Unknown command. Type 'help' for available commands.")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except EOFError:
            print("\nGoodbye!")
            break

def print_interactive_help():
    """Print help for interactive mode"""
    help_text = """
Available Commands:
  gen <country> [count] [--no-cc]  - Generate phone numbers
                                     Example: gen us 5
                                     Example: gen uk 3 --no-cc
  list, countries, l               - List supported countries
  help, h                         - Show this help
  quit, exit, q                   - Exit the program

Countries: us, uk, ca, au, de, fr, it, es, br, in
    """
    print(help_text)

def handle_interactive_generation(command: str, generator: PhoneNumberGenerator):
    """Handle generation command in interactive mode"""
    parts = command.split()
    
    if len(parts) < 2:
        print("Usage: gen <country> [count] [--no-cc]")
        return
    
    country_str = parts[1]
    count = 1
    include_country_code = True
    
    # Parse additional arguments
    if len(parts) > 2:
        try:
            count = int(parts[2])
        except ValueError:
            if parts[2] == "--no-cc":
                include_country_code = False
            else:
                print("Invalid count. Using default: 1")
    
    if len(parts) > 3 and parts[3] == "--no-cc":
        include_country_code = False
    
    # Validate country
    country = validate_country_code(country_str)
    if country is None:
        print(f"Error: Unsupported country code '{country_str}'")
        print("Use 'list' to see supported countries")
        return
    
    # Validate count
    if count < 1 or count > 100:
        print("Error: Count must be between 1 and 100 in interactive mode")
        return
    
    # Generate and display
    try:
        numbers = generator.generate_multiple(count, country, include_country_code, True)
        print(f"\nGenerated {len(numbers)} {generator.get_format_info(country).country} phone numbers:")
        for i, number in enumerate(numbers, 1):
            print(f"{i:2d}. {number}")
        print()
    except Exception as e:
        print(f"Error: {e}")

def output_numbers(numbers: List[str], format_type: str, country: CountryCode, 
                  generator: PhoneNumberGenerator):
    """Output generated numbers in the specified format"""
    if format_type == "json":
        output_data = {
            "country": generator.get_format_info(country).country,
            "country_code": country.value,
            "count": len(numbers),
            "numbers": numbers
        }
        print(json.dumps(output_data, indent=2))
        
    elif format_type == "csv":
        print("country,country_code,phone_number")
        country_info = generator.get_format_info(country)
        for number in numbers:
            print(f"{country_info.country},{country.value},{number}")
            
    else:  # text format
        country_info = generator.get_format_info(country)
        print(f"Generated {len(numbers)} {country_info.country} phone numbers:")
        print("=" * 50)
        for i, number in enumerate(numbers, 1):
            print(f"{i:3d}. {number}")

def create_batch_file():
    """Create a batch file for easy execution on Windows"""
    batch_content = """@echo off
python "%~dp0fake_phone_generator.py" %*
"""
    
    try:
        with open("/workspace/fake_phone_generator.bat", "w") as f:
            f.write(batch_content)
        print("Created fake_phone_generator.bat for Windows users")
    except Exception as e:
        print(f"Warning: Could not create batch file: {e}")

if __name__ == "__main__":
    main()