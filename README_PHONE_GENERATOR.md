# Fake Phone Number Generator

A comprehensive script to generate fake phone numbers for testing verification code systems. This tool supports multiple countries and provides various output formats.

## ⚠️ Important Notice

**This tool generates FAKE phone numbers for testing purposes ONLY. Do not use these numbers for actual communication or real verification systems.**

## Features

- 🌍 **Multi-Country Support**: 10 countries supported (US, UK, Canada, Australia, Germany, France, Italy, Spain, Brazil, India)
- 📱 **Realistic Formats**: Uses actual phone number patterns and valid area codes
- 🔄 **Multiple Output Formats**: Text, JSON, and CSV output
- 🎯 **Unique Generation**: Option to ensure all generated numbers are unique
- 💻 **CLI & Interactive Modes**: Command-line interface and interactive shell
- 🚀 **Easy to Use**: Simple commands with comprehensive help

## Installation

No installation required! Just ensure you have Python 3.6+ installed.

```bash
# Make scripts executable (Linux/macOS)
chmod +x fake_phone_generator.py phone-gen

# Or use Python directly
python3 fake_phone_generator.py --help
```

## Quick Start

### Basic Usage

```bash
# Generate 1 US phone number
./fake_phone_generator.py

# Generate 5 UK phone numbers
./fake_phone_generator.py --country uk --count 5

# Generate numbers without country code
./fake_phone_generator.py --country us --count 3 --no-country-code

# Use the wrapper script
./phone-gen --country de --count 2
```

### Interactive Mode

```bash
./fake_phone_generator.py --interactive
```

In interactive mode:
```
phone-gen> gen us 5
phone-gen> gen uk 3 --no-cc
phone-gen> list
phone-gen> help
phone-gen> quit
```

### Output Formats

#### Text Format (Default)
```bash
./fake_phone_generator.py --country us --count 3
```
Output:
```
Generated 3 United States phone numbers:
==================================================
  1. +1-555-123-4567
  2. +1-408-987-6543
  3. +1-212-555-0123
```

#### JSON Format
```bash
./fake_phone_generator.py --country uk --count 2 --format json
```
Output:
```json
{
  "country": "United Kingdom",
  "country_code": "uk",
  "count": 2,
  "numbers": [
    "+44-7700-123456",
    "+44-7701-987654"
  ]
}
```

#### CSV Format
```bash
./fake_phone_generator.py --country de --count 2 --format csv
```
Output:
```csv
country,country_code,phone_number
Germany,de,+49-172-12345678
Germany,de,+49-173-87654321
```

## Supported Countries

| Country | Code | Example Format | Description |
|---------|------|----------------|-------------|
| United States | `us` | +1-555-123-4567 | US format with area code |
| United Kingdom | `uk` | +44-7700-123456 | UK mobile format |
| Canada | `ca` | +1-416-123-4567 | Canadian format (same as US) |
| Australia | `au` | +61-412-345-678 | Australian mobile format |
| Germany | `de` | +49-172-12345678 | German mobile format |
| France | `fr` | +33-6-12-34-56-78 | French mobile format |
| Italy | `it` | +39-320-123-4567 | Italian mobile format |
| Spain | `es` | +34-612-34-56-78 | Spanish mobile format |
| Brazil | `br` | +55-11-91234-5678 | Brazilian mobile format |
| India | `in` | +91-98765-43210 | Indian mobile format |

## Command Line Options

```
usage: fake_phone_generator.py [-h] [--country COUNTRY] [--count COUNT]
                              [--no-country-code] [--format {text,json,csv}]
                              [--unique] [--list-countries] [--interactive]
                              [--quiet]

optional arguments:
  -h, --help            show this help message and exit
  --country COUNTRY, -c COUNTRY
                        Country code (us, uk, ca, au, de, fr, it, es, br, in). Default: us
  --count COUNT, -n COUNT
                        Number of phone numbers to generate. Default: 1
  --no-country-code     Generate numbers without country code prefix
  --format {text,json,csv}, -f {text,json,csv}
                        Output format. Default: text
  --unique              Ensure all generated numbers are unique (default: True)
  --list-countries, -l  List all supported countries and their formats
  --interactive, -i     Run in interactive mode
  --quiet, -q           Suppress banner and extra output
```

## Usage Examples

### Generate US Numbers for Testing
```bash
# Generate 10 US numbers for testing
./fake_phone_generator.py --country us --count 10

# Generate US numbers without country code
./fake_phone_generator.py --country us --count 5 --no-country-code
```

### Generate International Numbers
```bash
# Generate UK mobile numbers
./fake_phone_generator.py --country uk --count 5

# Generate German numbers in JSON format
./fake_phone_generator.py --country de --count 3 --format json

# Generate Brazilian numbers for CSV import
./fake_phone_generator.py --country br --count 20 --format csv > brazil_numbers.csv
```

### Batch Operations
```bash
# Generate numbers for multiple countries
for country in us uk de fr; do
    echo "=== $country ===" 
    ./fake_phone_generator.py --country $country --count 3 --quiet
    echo
done

# Save to files
./fake_phone_generator.py --country us --count 100 --format json > us_numbers.json
./fake_phone_generator.py --country uk --count 50 --format csv > uk_numbers.csv
```

## Use Cases

### Testing Verification Systems
```bash
# Generate test numbers for SMS verification testing
./fake_phone_generator.py --country us --count 20 --format json > test_numbers.json

# Generate numbers for different regions
./fake_phone_generator.py --country uk --count 10 --no-country-code
```

### Development & QA
```bash
# Quick single number for development
./fake_phone_generator.py --country us --quiet

# Batch generation for QA testing
./fake_phone_generator.py --country de --count 50 --format csv
```

### Form Testing
```bash
# Generate numbers without country codes for form testing
./fake_phone_generator.py --country us --count 10 --no-country-code --quiet
```

## Technical Details

### Phone Number Formats

The generator uses realistic phone number patterns:

- **US/Canada**: Uses real area codes and avoids invalid exchange codes
- **UK**: Uses valid mobile prefixes (7400-7999 range)
- **Germany**: Uses proper mobile prefixes (15x, 16x, 17x)
- **France**: Uses correct mobile prefixes (06, 07)
- **Other countries**: Follow official numbering plans

### Validation Features

- Ensures generated numbers follow country-specific patterns
- Avoids invalid number ranges (like 0xx or 1xx exchanges in US)
- Supports unique number generation to prevent duplicates
- Validates input parameters and provides helpful error messages

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x fake_phone_generator.py
   ```

2. **Python Not Found**
   ```bash
   # Use full python3 path or install Python 3
   python3 fake_phone_generator.py --help
   ```

3. **Invalid Country Code**
   ```bash
   # List supported countries
   ./fake_phone_generator.py --list-countries
   ```

### Error Messages

- `Unsupported country code`: Use `--list-countries` to see valid codes
- `Count must be between 1 and 1000`: Adjust the count parameter
- `Python 3 is required`: Install Python 3.6 or higher

## Contributing

This is a standalone script designed for testing purposes. Feel free to modify it for your specific needs.

## License

This tool is provided as-is for testing purposes. Use responsibly and ethically.

---

**Remember**: These are FAKE numbers for testing only. Never use them for actual communication or real verification systems.