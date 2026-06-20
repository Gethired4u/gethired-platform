#!/usr/bin/env python3
"""
Setup script for ATS Resume Analyzer dependencies.
Run this script to install required NLP models and dependencies.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main setup function."""
    print("🚀 Setting up ATS Resume Analyzer dependencies...\n")

    # Install spaCy English model
    if not run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English language model"):
        print("⚠️  Warning: spaCy model download failed. NLP features will be limited.")
        print("   You can manually install it later with: python -m spacy download en_core_web_sm")
        return

    # Install other Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install dependencies. Please check your Python environment.")
        return

    print("\n🎉 Setup completed successfully!")
    print("\n📋 What's been installed:")
    print("   • spaCy English language model (en_core_web_sm)")
    print("   • PDF processing libraries (pdfplumber)")
    print("   • Document processing libraries (python-docx)")
    print("   • Machine learning libraries (scikit-learn, transformers, torch)")
    print("   • Data processing libraries (pandas, numpy)")
    print("\n🚀 Your ATS Resume Analyzer is ready to use!")

if __name__ == "__main__":
    main()