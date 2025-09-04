/**
 * Automated testing utilities for production monitoring
 */

export interface TestCase {
  id: string;
  name: string;
  category: 'functionality' | 'performance' | 'accessibility' | 'security';
  test: () => Promise<TestResult>;
}

export interface TestResult {
  passed: boolean;
  message: string;
  duration: number;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  results: Map<string, TestResult>;
}

class AutomatedTester {
  private testSuites: Map<string, TestSuite> = new Map();

  registerTestSuite(name: string, tests: TestCase[]) {
    this.testSuites.set(name, {
      name,
      tests,
      results: new Map()
    });
  }

  async runTests(suiteName?: string): Promise<Map<string, Map<string, TestResult>>> {
    const results = new Map<string, Map<string, TestResult>>();
    
    const suitesToRun = suiteName 
      ? [this.testSuites.get(suiteName)].filter(Boolean)
      : Array.from(this.testSuites.values());

    for (const suite of suitesToRun) {
      if (!suite) continue;
      
      const suiteResults = new Map<string, TestResult>();
      
      for (const test of suite.tests) {
        const startTime = performance.now();
        
        try {
          const result = await test.test();
          const duration = performance.now() - startTime;
          
          suiteResults.set(test.id, {
            ...result,
            duration
          });
          
        } catch (error) {
          const duration = performance.now() - startTime;
          
          suiteResults.set(test.id, {
            passed: false,
            message: error instanceof Error ? error.message : 'Test failed',
            duration,
            details: error
          });
        }
      }
      
      suite.results = suiteResults;
      results.set(suite.name, suiteResults);
    }
    
    return results;
  }

  generateReport(results: Map<string, Map<string, TestResult>>): string {
    let report = '# Automated Test Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    let totalTests = 0;
    let passedTests = 0;

    for (const [suiteName, suiteResults] of results.entries()) {
      report += `## ${suiteName}\n\n`;
      
      for (const [testId, result] of suiteResults.entries()) {
        totalTests++;
        if (result.passed) passedTests++;
        
        const status = result.passed ? '✅' : '❌';
        report += `${status} ${testId}: ${result.message} (${result.duration.toFixed(2)}ms)\n`;
      }
      
      report += '\n';
    }

    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    report += `**Overall: ${passedTests}/${totalTests} tests passed (${successRate}%)**\n`;

    return report;
  }
}

// Initialize with core test suites
const tester = new AutomatedTester();

// Critical functionality tests
tester.registerTestSuite('core-functionality', [
  {
    id: 'page-load',
    name: 'Page loads successfully',
    category: 'functionality',
    test: async () => {
      const isLoaded = document.readyState === 'complete';
      return {
        passed: isLoaded,
        message: isLoaded ? 'Page loaded successfully' : 'Page not fully loaded',
        duration: 0
      };
    }
  },
  {
    id: 'api-connectivity',
    name: 'API is accessible',
    category: 'functionality',
    test: async () => {
      try {
        const response = await fetch('/api/health');
        const passed = response.ok;
        return {
          passed,
          message: passed ? 'API is accessible' : `API returned ${response.status}`,
          duration: 0
        };
      } catch (error) {
        return {
          passed: false,
          message: 'API is not accessible',
          duration: 0
        };
      }
    }
  },
  {
    id: 'local-storage',
    name: 'Local storage is available',
    category: 'functionality',
    test: async () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return {
          passed: true,
          message: 'Local storage is working',
          duration: 0
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Local storage is not available',
          duration: 0
        };
      }
    }
  }
]);

// Performance tests
tester.registerTestSuite('performance', [
  {
    id: 'bundle-size',
    name: 'Bundle size within limits',
    category: 'performance',
    test: async () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
      const limit = 500 * 1024; // 500KB
      const passed = totalSize <= limit;
      
      return {
        passed,
        message: passed 
          ? `Bundle size OK (${(totalSize / 1024).toFixed(1)}KB)`
          : `Bundle too large (${(totalSize / 1024).toFixed(1)}KB > 500KB)`,
        duration: 0,
        details: { totalSize, limit }
      };
    }
  },
  {
    id: 'memory-usage',
    name: 'Memory usage reasonable',
    category: 'performance',
    test: async () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limit = 50; // 50MB
        const passed = usedMB <= limit;
        
        return {
          passed,
          message: passed 
            ? `Memory usage OK (${usedMB.toFixed(1)}MB)`
            : `High memory usage (${usedMB.toFixed(1)}MB > ${limit}MB)`,
          duration: 0,
          details: { usedMB, limit }
        };
      }
      
      return {
        passed: true,
        message: 'Memory API not available',
        duration: 0
      };
    }
  }
]);

// Accessibility tests
tester.registerTestSuite('accessibility', [
  {
    id: 'aria-labels',
    name: 'Interactive elements have ARIA labels',
    category: 'accessibility',
    test: async () => {
      const interactive = document.querySelectorAll('button, a, input, select, textarea');
      let missingLabels = 0;
      
      interactive.forEach(el => {
        const hasLabel = !!(
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          el.textContent?.trim() ||
          (el as HTMLInputElement).placeholder
        );
        
        if (!hasLabel) missingLabels++;
      });
      
      const passed = missingLabels === 0;
      return {
        passed,
        message: passed 
          ? 'All interactive elements have labels'
          : `${missingLabels} elements missing labels`,
        duration: 0,
        details: { total: interactive.length, missing: missingLabels }
      };
    }
  }
]);

export { tester as automatedTester };

// Hook for running tests
export function useAutomatedTesting() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Map<string, Map<string, TestResult>> | null>(null);

  const runTests = async (suiteName?: string) => {
    setIsRunning(true);
    try {
      const testResults = await tester.runTests(suiteName);
      setResults(testResults);
      return testResults;
    } finally {
      setIsRunning(false);
    }
  };

  const generateReport = () => {
    if (!results) return '';
    return tester.generateReport(results);
  };

  return {
    isRunning,
    results,
    runTests,
    generateReport
  };
}