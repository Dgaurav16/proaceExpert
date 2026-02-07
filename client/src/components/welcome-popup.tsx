import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface WelcomePopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WelcomePopup({ isVisible, onClose }: WelcomePopupProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50">
          {/* Cricket Stadium Background */}
          <div className="relative h-32 bg-gradient-to-b from-sky-200 to-green-200 rounded-lg mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-amber-600 rounded-t-lg"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-12 bg-red-600 rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-x-8 w-16 h-2 bg-amber-800 rounded-full"></div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-2">Welcome to ProAce Predictions!</h2>
            <p className="text-red-600 font-medium">🏏 Pure Cricket Predictions • 100% Free • No Gambling</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-green-700">No Betting, No Gambling</h3>
              </div>
              <p className="text-sm text-green-600">Purely prediction-based fun with no money involved</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-blue-700">100% Free</h3>
              </div>
              <p className="text-sm text-blue-600">By cricket fans, for cricket fans - completely free</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="font-semibold text-purple-700">Transparent & Safe</h3>
              </div>
              <p className="text-sm text-purple-600">No money, no risks - just cricket knowledge</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold text-orange-700">Open to All</h3>
              </div>
              <p className="text-sm text-orange-600">Free for every cricket lover worldwide</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-600">🏆 Fair Play - Like Chess, Skill Over Luck</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              At ProAce Predictions, we celebrate cricket knowledge and prediction skills. This is a 
              safe, family-friendly platform where fans can showcase their cricket expertise without 
              any financial risks or gambling elements.
            </p>
          </div>

          {/* Features List */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Pure Cricket Predictions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">No Money</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">No Gambling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Just Fun!</span>
              </div>
            </div>
          </div>

          {/* Accept Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg"
            >
              I Agree - Let's Play Cricket Predictions! 🏏
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              By clicking "I Agree", you confirm that you understand this is a free, non-gambling cricket prediction platform for 
              entertainment purposes only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}