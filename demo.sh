#!/bin/bash
# Demo script for Fake Phone Number Generator

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                Phone Number Generator Demo                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

echo "🇺🇸 Generating 3 US phone numbers:"
./fake_phone_generator.py --country us --count 3 --quiet
echo

echo "🇬🇧 Generating 2 UK phone numbers (JSON format):"
./fake_phone_generator.py --country uk --count 2 --format json --quiet
echo

echo "🇩🇪 Generating 2 German phone numbers without country code:"
./fake_phone_generator.py --country de --count 2 --no-country-code --quiet
echo

echo "🇫🇷 Generating 1 French phone number (CSV format):"
./fake_phone_generator.py --country fr --count 1 --format csv --quiet
echo

echo "🌍 Mixed countries demo:"
for country in us uk au de fr; do
    echo "--- $country ---"
    ./fake_phone_generator.py --country $country --count 1 --quiet
done
echo

echo "✨ Demo complete! Use './fake_phone_generator.py --help' for more options."