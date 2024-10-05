import { hexToNumber } from '@multiplechain/utils'
import TxDecoder from '@beycandeveloper/tron-tx-decoder'
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import TronSocket, { Block, Transaction, TransactionFilter } from '../src/main'

describe('Tests', () => {
    let decoder: TxDecoder, tronSocket: TronSocket

    const token = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

    beforeAll(async () => {
        tronSocket = new TronSocket('a2fbe810-9875-4b96-b1d4-6a44090262b9')
        decoder = new TxDecoder('https://api.trongrid.io')
        // @ts-expect-error for testing purposes
        tronSocket.socketUrl = 'http://localhost:3001'
        await tronSocket.connect().catch((error) => {
            console.error(error)
            process.exit(1)
        })
    })

    test('listen 3 blocks tx size > 250', async () => {
        await new Promise((resolve) => {
            let count = 0
            const cb = (block: Block) => {
                if (block.transactionSize > 250) {
                    count++
                    if (count === 3) {
                        tronSocket.off('block', cb)
                        expect(true).toBe(true)
                        resolve(true)
                    }
                }
            }
            tronSocket.on('block', cb)
        })
    })

    test('Listen USDT (amount > 0.5)', async () => {
        await new Promise((resolve) => {
            const filter: TransactionFilter = {
                toAddress: token
            }

            const callback = async (data: Transaction) => {
                const reTryFunc = async (transactionId: string) => {
                    try {
                        let amount = 0
                        const result = await decoder.decodeInputById(transactionId)
                        if (result.methodName === 'transferFrom') {
                            amount = hexToNumber((result.decodedInput[2] as bigint).toString(), 6)
                        }

                        amount = hexToNumber((result.decodedInput[1] as bigint).toString(), 6)

                        if (amount > 0.5) {
                            tronSocket.off('transaction', callback, filter)
                            expect(true).toBe(true)
                            resolve(true)
                        }
                    } catch (error) {
                        await new Promise((resolve) => setTimeout(resolve, 5000))
                        await reTryFunc(transactionId)
                    }
                }
                reTryFunc(data.transactionId)
            }

            tronSocket.on('transaction', callback, filter)
        })
    })

    test('Listen USDT any amount', async () => {
        await new Promise((resolve) => {
            const filter = {
                toAddress: token
            }
    
            const callback = (data: Transaction) => {
                if (data.toAddress.toLowerCase() === token.toLowerCase()) {
                    tronSocket.off('transaction', callback, filter)
                    expect(true).toBe(true)
                    resolve(true)
                }
            }
    
            tronSocket.on('transaction', callback, filter)
        })
    })

    test('Listen TRX (amount > 10)', async () => {
        await new Promise((resolve) => {
            const filter: TransactionFilter = {
                assetName: 'TRX'
            }

            const callback = (data: Transaction) => {
                if ((data.assetAmount as number) > 10 * 1e6) {
                    tronSocket.off('transaction', callback, filter)
                    expect(true).toBe(true)
                    resolve(true)
                }
            }

            tronSocket.on('transaction', callback, filter)
        })
    })

    afterAll(async () => {
        await tronSocket.disconnect()
    })
})
