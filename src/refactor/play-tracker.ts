import type { WembleyT, ConfigT, InitializeConfigT, StopTargetT, BaseSettingsT } from '../types.js'
import { createPlayer, loadInstrumentsWithNewFormat, createEnhancedGear } from '../player.js'
import { fetchSoundfont } from './fetch-soundfont.js'
import { listerine } from 'listerine'
import { NoteDesigner } from './note-designer.js'

// This is just a mental concept I am trying
// to follow and understand. The question is --
// where do we store all playing noteInstances
// together to be queried? Does an instrument
// need to manage and hold its playing notes,
// or can it just query a third party store
// for npte instances associated with the instrument?

export class PlayTracker {
	private instances = [] as any[]
	private instanceGroups = {}

	add = (instance: any) => {
		this.instances.push(instance)
	}

	find = (query) => {
		const list = listerine(this.instances)
		return list.find(query)
	}

	findOne = (query) => {
		const list = listerine(this.instances)
		return list.findOne(query)
	}
}
