/**
 * Dependency monitoring and security scanning
 */

interface Dependency {
  name: string;
  version: string;
  vulnerabilities: Vulnerability[];
  outdated: boolean;
  critical: boolean;
}

interface Vulnerability {
  id: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  patchedVersions?: string;
  cwe?: string;
}

class DependencyMonitor {
  private dependencies: Map<string, Dependency> = new Map();

  async scanDependencies(): Promise<Map<string, Dependency>> {
    // In a real implementation, this would:
    // 1. Read package.json and lock file
    // 2. Check against vulnerability databases
    // 3. Check for outdated packages
    // 4. Return comprehensive report

    // For now, simulate some common checks
    const mockDependencies = this.getMockDependencies();
    
    for (const [name, dep] of mockDependencies.entries()) {
      this.dependencies.set(name, dep);
    }

    return this.dependencies;
  }

  private getMockDependencies(): Map<string, Dependency> {
    const deps = new Map<string, Dependency>();

    // Example React dependency
    deps.set('react', {
      name: 'react',
      version: '18.2.0',
      vulnerabilities: [],
      outdated: false,
      critical: false
    });

    // Example dependency with vulnerability
    deps.set('example-vulnerable-package', {
      name: 'example-vulnerable-package',
      version: '1.0.0',
      vulnerabilities: [
        {
          id: 'CVE-2023-XXXX',
          severity: 'moderate',
          title: 'Prototype Pollution Vulnerability',
          description: 'A prototype pollution vulnerability exists in older versions',
          patchedVersions: '>=1.2.0',
          cwe: 'CWE-1321'
        }
      ],
      outdated: true,
      critical: false
    });

    return deps;
  }

  getVulnerabilities(): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    
    for (const dep of this.dependencies.values()) {
      vulnerabilities.push(...dep.vulnerabilities);
    }

    return vulnerabilities.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  getCriticalIssues(): Dependency[] {
    return Array.from(this.dependencies.values())
      .filter(dep => dep.critical || 
        dep.vulnerabilities.some(v => v.severity === 'critical' || v.severity === 'high')
      );
  }

  getOutdatedPackages(): Dependency[] {
    return Array.from(this.dependencies.values()).filter(dep => dep.outdated);
  }

  generateSecurityReport(): string {
    const vulnerabilities = this.getVulnerabilities();
    const critical = this.getCriticalIssues();
    const outdated = this.getOutdatedPackages();

    let report = '# Dependency Security Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Dependencies: ${this.dependencies.size}\n`;
    report += `Vulnerabilities: ${vulnerabilities.length}\n`;
    report += `Critical Issues: ${critical.length}\n`;
    report += `Outdated Packages: ${outdated.length}\n\n`;

    if (critical.length > 0) {
      report += '## 🚨 Critical Issues\n\n';
      critical.forEach(dep => {
        report += `**${dep.name}@${dep.version}**\n`;
        dep.vulnerabilities.forEach(vuln => {
          if (vuln.severity === 'critical' || vuln.severity === 'high') {
            report += `- ${vuln.severity.toUpperCase()}: ${vuln.title}\n`;
            report += `  ${vuln.description}\n`;
            if (vuln.patchedVersions) {
              report += `  Fix: Update to ${vuln.patchedVersions}\n`;
            }
          }
        });
        report += '\n';
      });
    }

    if (vulnerabilities.length > 0) {
      report += '## ⚠️ All Vulnerabilities\n\n';
      vulnerabilities.forEach(vuln => {
        report += `- **${vuln.severity.toUpperCase()}**: ${vuln.title} (${vuln.id})\n`;
        report += `  ${vuln.description}\n\n`;
      });
    }

    if (outdated.length > 0) {
      report += '## 📦 Outdated Packages\n\n';
      outdated.forEach(dep => {
        report += `- ${dep.name}@${dep.version}\n`;
      });
    }

    return report;
  }

  async checkForUpdates(): Promise<string[]> {
    // In real implementation, check npm registry for updates
    // For now, return mock recommendations
    
    const recommendations: string[] = [];
    
    this.getOutdatedPackages().forEach(dep => {
      recommendations.push(`Update ${dep.name} to latest version`);
    });

    this.getCriticalIssues().forEach(dep => {
      dep.vulnerabilities.forEach(vuln => {
        if (vuln.patchedVersions) {
          recommendations.push(`Update ${dep.name} to ${vuln.patchedVersions} to fix ${vuln.id}`);
        }
      });
    });

    return recommendations;
  }
}

// Global dependency monitor
export const dependencyMonitor = new DependencyMonitor();