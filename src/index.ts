import { Command } from 'commander'
import { initCommand } from './commands/init.js'

const program = new Command()

program
  .name('saas-init')
  .description('CLI scaffolding tool for production-ready SaaS projects')
  .version('1.0.0')

program.command('init').description('Scaffold a new SaaS project').action(initCommand)

program.parse()
