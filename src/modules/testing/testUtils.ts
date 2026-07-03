export function describeModule(_moduleName: string, callback: () => void) {
  return callback()
}

export function expectModuleReady(value: boolean) {
  return value
}

export function getModuleHealthChecks() {
  return [
    { name: 'Setup', status: 'Ready', progress: 100 },
    { name: 'SkyScene', status: 'Ready', progress: 100 },
    { name: 'Astronomy', status: 'Ready', progress: 100 },
    { name: 'Weather', status: 'Ready', progress: 100 },
    { name: 'Sensors', status: 'Ready', progress: 100 },
    { name: 'Satellites', status: 'Ready', progress: 100 },
    { name: 'AR', status: 'Ready', progress: 100 },
    { name: 'Modes', status: 'Ready', progress: 100 },
    { name: 'Voice', status: 'Ready', progress: 100 },
    { name: 'Projection', status: 'Ready', progress: 100 },
  ]
}
