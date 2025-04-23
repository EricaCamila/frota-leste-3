"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set, remove } from "firebase/database"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export function AlertSystem() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [newAlertOpen, setNewAlertOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    severity: "info",
    vehicleId: "",
  })
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    // Buscar alertas
    const alertsRef = ref(database, "alerts")
    const unsubscribeAlerts = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const alertsList = Object.entries(data)
          .map(([id, alert]) => ({
            id,
            ...alert,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)

        setAlerts(alertsList)
        setUnreadCount(alertsList.filter((alert) => !alert.read).length)
      } else {
        setAlerts([])
        setUnreadCount(0)
      }
    })

    // Buscar veículos para o formulário de novo alerta
    const vehiclesRef = ref(database, "vehicles")
    const unsubscribeVehicles = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const vehiclesList = Object.entries(data).map(([id, vehicle]) => ({
          id,
          ...vehicle,
        }))
        setVehicles(vehiclesList)
      } else {
        setVehicles([])
      }
    })

    return () => {
      unsubscribeAlerts()
      unsubscribeVehicles()
    }
  }, [])

  const handleMarkAsRead = async (alertId) => {
    try {
      const alertRef = ref(database, `alerts/${alertId}`)
      await set(alertRef, {
        ...alerts.find((a) => a.id === alertId),
        read: true,
      })
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error)
    }
  }

  const handleDeleteAlert = async (alertId) => {
    try {
      const alertRef = ref(database, `alerts/${alertId}`)
      await remove(alertRef)
      toast({
        title: "Alerta removido",
        description: "O alerta foi removido com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao remover alerta:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o alerta.",
      })
    }
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault()

    try {
      const alertsRef = ref(database, "alerts")
      const newAlertRef = push(alertsRef)

      await set(newAlertRef, {
        ...newAlert,
        timestamp: Date.now(),
        read: false,
      })

      setNewAlert({
        title: "",
        description: "",
        severity: "info",
        vehicleId: "",
      })

      setNewAlertOpen(false)

      toast({
        title: "Alerta criado",
        description: "O alerta foi criado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao criar alerta:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o alerta.",
      })
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas do Sistema
            </DialogTitle>
            <DialogDescription>Alertas e notificações recentes do sistema.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {alerts.length > 0 ? (
              <div className="space-y-4 py-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg ${!alert.read ? "bg-gray-50" : ""}`}
                    onClick={() => !alert.read && handleMarkAsRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{alert.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityClass(alert.severity)}`}>
                            {alert.severity === "critical"
                              ? "Crítico"
                              : alert.severity === "warning"
                                ? "Atenção"
                                : "Informação"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString("pt-BR")}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAlert(alert.id)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Não há alertas no momento.</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => setNewAlertOpen(true)}>Novo Alerta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newAlertOpen} onOpenChange={setNewAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Alerta</DialogTitle>
            <DialogDescription>Preencha os campos para criar um novo alerta no sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAlert}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severidade</Label>
                <Select
                  value={newAlert.severity}
                  onValueChange={(value) => setNewAlert({ ...newAlert, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="warning">Atenção</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo (opcional)</Label>
                <Select
                  value={newAlert.vehicleId}
                  onValueChange={(value) => setNewAlert({ ...newAlert, vehicleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.placa} - {vehicle.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setNewAlertOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Alerta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
