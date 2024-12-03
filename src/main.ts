import { Socket, io } from 'socket.io-client'
import {
    EventFilters,
    EventTypes,
    ContractEvent,
    ContractLog,
    SolidityEvent,
    SolidityLog
} from '@tronsocket/types'

export * from '@tronsocket/types'

type EmitError = {
    message: string
    code: number
    key?: string
}

type Events = keyof EventTypes

type Filters<E extends Events> = EventFilters[E]

type Callback<E extends Events> = (data: EventTypes[E]) => void

export default class TronSocket {
    private token: string

    private testnet: boolean

    private socket: Socket | null = null

    private socketUrl: string = 'https://ws.tronsocket.com'

    constructor(token: string, testnet: boolean = false) {
        this.token = token
        this.testnet = testnet
    }

    public async connect(polling: boolean = false): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const args: {
                query: {
                    token: string
                    testnet: boolean
                }
                transports?: string[]
            } = {
                query: {
                    token: this.token,
                    testnet: this.testnet
                },
                transports: ['websocket']
            }

            if (polling) {
                delete args.transports
            }

            this.socket = io(this.socketUrl, args)

            this.socket.on('ready', () => {
                resolve(true)
            })

            this.socket.on('error', (error: EmitError) => {
                reject(error)
            })

            this.socket.on('connect_error', (error) => {
                reject(error)
            })
        })
    }

    public async disconnect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                this.socket.on('disconnect', () => {
                    this.socket = null
                    resolve(true)
                })
                this.socket.disconnect()
            } else {
                reject(new Error('Socket not connected'))
            }
        })
    }

    private simpleHash(str: string): string {
        let hash = 0
        for (let i = 0; i < str?.length; i++) {
            const char = str.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16)
    }

    private createEventKey<E extends Events>(
        event: E,
        callback: Callback<E>,
        filter?: Filters<E>
    ): string {
        const stringFilter = this.simpleHash(JSON.stringify(filter))
        const stringFunction = this.simpleHash(callback.toString())
        const definer = stringFilter + stringFunction
        return event + `-${definer}`
    }

    public subscribe<E extends Events>(event: E, callback: Callback<E>, filter?: Filters<E>): void {
        if (this.socket) {
            const eventKey = this.createEventKey(event, callback, filter)
            this.socket.emit('subscribe', eventKey, filter)
            this.socket.on(eventKey, callback)
        } else {
            throw new Error('Socket not connected')
        }
    }

    public on<E extends Events>(event: E, callback: Callback<E>, filter?: Filters<E>): void {
        this.subscribe(event, callback, filter)
    }

    public unsubscribe<E extends Events>(
        event: E,
        callback: Callback<E>,
        filter?: Filters<E>
    ): void {
        if (this.socket) {
            const eventKey = this.createEventKey(event, callback, filter)
            this.socket.emit('unsubscribe', eventKey, filter)
            this.socket.off(eventKey, callback)
        } else {
            throw new Error('Socket not connected')
        }
    }

    public off<E extends Events>(event: E, callback: Callback<E>, filter?: Filters<E>): void {
        this.unsubscribe(event, callback, filter)
    }

    public error(callback: (error: EmitError) => void): void {
        if (this.socket) {
            this.socket.on('error', callback)
        } else {
            throw new Error('Socket not connected')
        }
    }

    isSolidityEvent(data: EventTypes['solidity']): data is SolidityEvent {
        return 'eventName' in data
    }

    isSolidityLog(data: EventTypes['solidity']): data is SolidityLog {
        return !('eventName' in data)
    }

    isContractEvent(data: EventTypes['contract']): data is ContractEvent {
        return 'eventName' in data
    }

    isContractLog(data: EventTypes['contract']): data is ContractLog {
        return !('eventName' in data)
    }
}
