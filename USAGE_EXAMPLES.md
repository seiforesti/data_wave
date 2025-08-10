# Quick Usage Examples - Fake Phone Number Generator

## 🚀 Most Common Commands

```bash
# Generate 1 US number (default)
./fake_phone_generator.py

# Generate 5 US numbers
./fake_phone_generator.py --count 5

# Generate UK numbers
./fake_phone_generator.py --country uk --count 3

# Generate without country code
./fake_phone_generator.py --country us --count 5 --no-country-code

# JSON output for API testing
./fake_phone_generator.py --country us --count 10 --format json

# CSV output for spreadsheets
./fake_phone_generator.py --country uk --count 20 --format csv > test_numbers.csv
```

## 🌍 Country-Specific Examples

```bash
# US numbers for American services
./fake_phone_generator.py --country us --count 10

# UK mobile numbers
./fake_phone_generator.py --country uk --count 5

# German mobile numbers
./fake_phone_generator.py --country de --count 3

# French mobile numbers
./fake_phone_generator.py --country fr --count 3

# Brazilian mobile numbers
./fake_phone_generator.py --country br --count 3

# Indian mobile numbers
./fake_phone_generator.py --country in --count 3
```

## 📱 For Verification Testing

```bash
# Generate test numbers for SMS verification
./fake_phone_generator.py --country us --count 50 --format json > sms_test_numbers.json

# Generate numbers for form validation testing
./fake_phone_generator.py --country us --count 20 --no-country-code --quiet

# Generate international numbers for global testing
for country in us uk de fr br in; do
    ./fake_phone_generator.py --country $country --count 5 --format json > ${country}_numbers.json
done
```

## 🔧 Advanced Usage

```bash
# Interactive mode for manual testing
./fake_phone_generator.py --interactive

# Quiet mode for scripting
./fake_phone_generator.py --country us --count 5 --quiet

# List all supported countries
./fake_phone_generator.py --list-countries

# Using the wrapper script
./phone-gen --country uk --count 3
```

## 💡 Pro Tips

1. **For API Testing**: Use JSON format
   ```bash
   ./fake_phone_generator.py --country us --count 100 --format json > api_test_numbers.json
   ```

2. **For Database Seeding**: Use CSV format
   ```bash
   ./fake_phone_generator.py --country us --count 1000 --format csv > seed_numbers.csv
   ```

3. **For Form Testing**: Use no country code
   ```bash
   ./fake_phone_generator.py --country us --count 10 --no-country-code --quiet
   ```

4. **For International Testing**: Generate multiple countries
   ```bash
   for country in us uk de fr es it; do
       echo "=== $country ==="
       ./fake_phone_generator.py --country $country --count 5 --quiet
   done
   ```

5. **Quick Single Number**: 
   ```bash
   ./fake_phone_generator.py --quiet
   ```

Remember: These are FAKE numbers for testing only! 🚨