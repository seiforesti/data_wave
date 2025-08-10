#!/bin/bash
# Installation script for Fake Phone Number Generator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Fake Phone Number Generator Installer             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not installed.${NC}"
    echo "Please install Python 3.6 or higher and try again."
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓ Python 3 found: $PYTHON_VERSION${NC}"

# Make scripts executable
echo -e "${YELLOW}Making scripts executable...${NC}"
chmod +x "$SCRIPT_DIR/fake_phone_generator.py"
chmod +x "$SCRIPT_DIR/phone-gen"

# Test the script
echo -e "${YELLOW}Testing script functionality...${NC}"
if python3 "$SCRIPT_DIR/fake_phone_generator.py" --quiet --country us --count 1 > /dev/null; then
    echo -e "${GREEN}✓ Script test successful${NC}"
else
    echo -e "${RED}✗ Script test failed${NC}"
    exit 1
fi

# Ask if user wants system-wide installation
echo
echo -e "${YELLOW}Would you like to install the script system-wide? (y/N)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Installing system-wide...${NC}"
    
    # Check if we have sudo access
    if sudo -n true 2>/dev/null; then
        HAS_SUDO=true
    else
        echo "This requires sudo access. You may be prompted for your password."
        HAS_SUDO=false
    fi
    
    # Copy to /usr/local/bin
    sudo cp "$SCRIPT_DIR/fake_phone_generator.py" /usr/local/bin/
    sudo cp "$SCRIPT_DIR/phone-gen" /usr/local/bin/
    sudo chmod +x /usr/local/bin/fake_phone_generator.py
    sudo chmod +x /usr/local/bin/phone-gen
    
    # Create a symlink for easier access
    sudo ln -sf /usr/local/bin/fake_phone_generator.py /usr/local/bin/fake-phone-gen
    
    echo -e "${GREEN}✓ System-wide installation complete${NC}"
    echo -e "${GREEN}You can now use: fake-phone-gen or phone-gen from anywhere${NC}"
else
    echo -e "${YELLOW}Local installation complete.${NC}"
    echo -e "${GREEN}Use: ./fake_phone_generator.py or ./phone-gen from this directory${NC}"
fi

echo
echo -e "${BLUE}Installation Summary:${NC}"
echo "• Main script: fake_phone_generator.py"
echo "• Wrapper script: phone-gen"
echo "• Documentation: README_PHONE_GENERATOR.md"
echo
echo -e "${GREEN}Quick start examples:${NC}"
echo "  ./fake_phone_generator.py --help"
echo "  ./fake_phone_generator.py --country us --count 5"
echo "  ./fake_phone_generator.py --interactive"
echo "  ./phone-gen --country uk --count 3"
echo
echo -e "${YELLOW}Remember: These are FAKE numbers for testing only!${NC}"