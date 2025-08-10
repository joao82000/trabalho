import { Sun, Settings, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onExportData?: () => void;
}

export function Header({ onExportData }: HeaderProps) {
  return (
    <header className="bg-nasa-darker border-b border-nasa-gold/30 fixed w-full top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-nasa-gold rounded-full flex items-center justify-center">
                <Sun className="text-nasa-blue text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-nasa-gold">NASA Solar Analysis Platform</h1>
                <p className="text-xs text-gray-400">Watts on the Moon Challenge - Advanced Energy Systems</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <p className="text-sm text-gray-400">Real-Time Solar Energy Analysis & Mission Planning</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              className="bg-nasa-gold text-nasa-blue hover:bg-yellow-400"
              onClick={onExportData}
              data-testid="button-export-pdf"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF Report
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-nasa-gold hover:text-white"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
